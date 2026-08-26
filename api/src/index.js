// ============================================================
// CLOUDFLARE WORKER – Portfolio API (Full CRUD)
// ============================================================
const ADMIN_PASSWORD = 'zephan';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

// ============================================================
// GET /api/projects – Fetch all projects (sorted: live first)
// ============================================================
async function getProjects(env) {
    try {
        const { results } = await env.DB.prepare(
            'SELECT id, title, description, tech, link, live_demo, images, created_at FROM projects ORDER BY live_demo DESC, id DESC'
        ).all();

        return Response.json({
            success: true,
            projects: results || [],
        }, {
            headers: corsHeaders,
        });
    } catch (error) {
        return Response.json({
            success: false,
            error: 'Database error: ' + error.message,
        }, {
            status: 500,
            headers: corsHeaders,
        });
    }
}

// ============================================================
// POST /api/projects – Add a new project
// ============================================================
async function addProject(request, env) {
    try {
        const body = await request.json();
        const { title, description, tech, link, live_demo, images, password } = body;

        if (password !== ADMIN_PASSWORD) {
            return Response.json({
                success: false,
                error: 'Unauthorized: Incorrect password',
            }, {
                status: 401,
                headers: corsHeaders,
            });
        }

        if (!title || !description || !tech || !link) {
            return Response.json({
                success: false,
                error: 'All fields are required.',
            }, {
                status: 400,
                headers: corsHeaders,
            });
        }

        const liveDemo = live_demo ? 1 : 0;
        const imageUrls = images || '';

        const result = await env.DB.prepare(
            'INSERT INTO projects (title, description, tech, link, live_demo, images) VALUES (?, ?, ?, ?, ?, ?)'
        ).bind(title, description, tech, link, liveDemo, imageUrls).run();

        return Response.json({
            success: true,
            message: 'Project added!',
            project: {
                id: result.meta.last_row_id,
                title,
                description,
                tech,
                link,
                live_demo: liveDemo,
                images: imageUrls,
            },
        }, {
            headers: corsHeaders,
        });

    } catch (error) {
        return Response.json({
            success: false,
            error: error.message,
        }, {
            status: 500,
            headers: corsHeaders,
        });
    }
}

// ============================================================
// PUT /api/projects/:id – Edit a project
// ============================================================
async function editProject(request, env, id) {
    try {
        const body = await request.json();
        const { title, description, tech, link, live_demo, images, password } = body;

        if (password !== ADMIN_PASSWORD) {
            return Response.json({
                success: false,
                error: 'Unauthorized: Incorrect password',
            }, {
                status: 401,
                headers: corsHeaders,
            });
        }

        if (!title || !description || !tech || !link) {
            return Response.json({
                success: false,
                error: 'All fields are required.',
            }, {
                status: 400,
                headers: corsHeaders,
            });
        }

        const liveDemo = live_demo ? 1 : 0;
        const imageUrls = images || '';

        const result = await env.DB.prepare(
            'UPDATE projects SET title = ?, description = ?, tech = ?, link = ?, live_demo = ?, images = ? WHERE id = ?'
        ).bind(title, description, tech, link, liveDemo, imageUrls, id).run();

        if (result.meta.changes === 0) {
            return Response.json({
                success: false,
                error: 'Project not found',
            }, {
                status: 404,
                headers: corsHeaders,
            });
        }

        return Response.json({
            success: true,
            message: 'Project updated!',
            project: { id, title, description, tech, link, live_demo: liveDemo, images: imageUrls },
        }, {
            headers: corsHeaders,
        });

    } catch (error) {
        return Response.json({
            success: false,
            error: error.message,
        }, {
            status: 500,
            headers: corsHeaders,
        });
    }
}

// ============================================================
// DELETE /api/projects/:id – Delete a project
// ============================================================
async function deleteProject(request, env, id) {
    try {
        const body = await request.json();
        const { password } = body;

        if (password !== ADMIN_PASSWORD) {
            return Response.json({
                success: false,
                error: 'Unauthorized: Incorrect password',
            }, {
                status: 401,
                headers: corsHeaders,
            });
        }

        const result = await env.DB.prepare(
            'DELETE FROM projects WHERE id = ?'
        ).bind(id).run();

        if (result.meta.changes === 0) {
            return Response.json({
                success: false,
                error: 'Project not found',
            }, {
                status: 404,
                headers: corsHeaders,
            });
        }

        return Response.json({
            success: true,
            message: 'Project deleted!',
        }, {
            headers: corsHeaders,
        });

    } catch (error) {
        return Response.json({
            success: false,
            error: error.message,
        }, {
            status: 500,
            headers: corsHeaders,
        });
    }
}

// ============================================================
// POST /api/contact – Handle contact form submission
// ============================================================
async function handleContact(request, env) {
    try {
        const { name, email, message } = await request.json();

        if (!name || !email || !message) {
            return Response.json({
                success: false,
                error: 'All fields are required.',
            }, {
                status: 400,
                headers: corsHeaders,
            });
        }

        let emailError = null;
        try {
            const emailResponse = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${env.RESEND_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    from: 'Portfolio Contact <onboarding@resend.dev>',
                    to: ['programmerstayve@gmail.com'],
                    subject: `New message from ${name}`,
                    reply_to: email,
                    html: `
                        <h2>📩 New contact form message</h2>
                        <p><strong>From:</strong> ${name}</p>
                        <p><strong>Email:</strong> ${email}</p>
                        <p><strong>Message:</strong></p>
                        <p>${message.replace(/\n/g, '<br>')}</p>
                        <hr>
                        <p style="color: #666; font-size: 14px;">
                            💡 Reply to this email to respond to ${name} directly.
                        </p>
                    `,
                }),
            });

            if (!emailResponse.ok) {
                const errorData = await emailResponse.text();
                console.error('Resend error:', errorData);
                emailError = 'Email service temporarily unavailable.';
            }
        } catch (e) {
            console.error('Resend fetch error:', e);
            emailError = 'Email service temporarily unavailable.';
        }

        let discordError = null;
        try {
            const discordResponse = await fetch(env.DISCORD_WEBHOOK_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    content: `📩 **New message from ${name}**\n📧 Email: ${email}\n💬 Message:\n${message}`,
                }),
            });

            if (!discordResponse.ok) {
                const errorData = await discordResponse.text();
                console.error('Discord webhook error:', errorData);
                discordError = 'Discord notification temporarily unavailable.';
            }
        } catch (e) {
            console.error('Discord fetch error:', e);
            discordError = 'Discord notification temporarily unavailable.';
        }

        if (emailError && discordError) {
            return Response.json({
                success: false,
                error: 'Both email and Discord delivery failed. Please try again later.',
            }, {
                status: 500,
                headers: corsHeaders,
            });
        }

        let messageText = 'Message sent! ';
        if (emailError) messageText += '(Email: ' + emailError + ') ';
        if (discordError) messageText += '(Discord: ' + discordError + ') ';

        return Response.json({
            success: true,
            message: messageText.trim(),
        }, {
            headers: corsHeaders,
        });

    } catch (error) {
        return Response.json({
            success: false,
            error: error.message,
        }, {
            status: 500,
            headers: corsHeaders,
        });
    }
}

// ============================================================
// MAIN REQUEST HANDLER
// ============================================================
export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        const path = url.pathname;

        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: corsHeaders });
        }

        // Projects endpoints
        if (path === '/api/projects' && request.method === 'GET') {
            return await getProjects(env);
        }
        if (path === '/api/projects' && request.method === 'POST') {
            return await addProject(request, env);
        }
        if (path.startsWith('/api/projects/')) {
            const id = path.split('/')[3];
            if (!id) {
                return Response.json({
                    success: false,
                    error: 'Missing project ID',
                }, {
                    status: 400,
                    headers: corsHeaders,
                });
            }
            if (request.method === 'PUT') {
                return await editProject(request, env, id);
            }
            if (request.method === 'DELETE') {
                return await deleteProject(request, env, id);
            }
        }

        // Contact endpoint
        if (path === '/api/contact' && request.method === 'POST') {
            return await handleContact(request, env);
        }

        return Response.json({
            error: 'Not found',
        }, {
            status: 404,
            headers: corsHeaders,
        });
    },
};