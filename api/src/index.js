// ============================================================
// CLOUDFLARE WORKER – Portfolio API
// ============================================================
const ADMIN_PASSWORD = 'zephan'; // ← Password is safe here!

// Helper: CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

// ============================================================
// GET /api/projects – Fetch all projects
// ============================================================
async function getProjects(env) {
    try {
        const { results } = await env.DB.prepare(
            'SELECT id, title, description, tech, link, created_at FROM projects ORDER BY id DESC'
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
// POST /api/projects – Add a new project (password required)
// ============================================================
async function addProject(request, env) {
    try {
        const body = await request.json();
        const { title, description, tech, link, password } = body;

        // ✅ Password validation happens HERE (safe on the server)
        if (password !== ADMIN_PASSWORD) {
            return Response.json({
                success: false,
                error: 'Unauthorized: Incorrect password',
            }, {
                status: 401,
                headers: corsHeaders,
            });
        }

        // Validation
        if (!title || !description || !tech || !link) {
            return Response.json({
                success: false,
                error: 'All fields are required.',
            }, {
                status: 400,
                headers: corsHeaders,
            });
        }

        // Insert into D1
        const result = await env.DB.prepare(
            'INSERT INTO projects (title, description, tech, link) VALUES (?, ?, ?, ?)'
        ).bind(title, description, tech, link).run();

        return Response.json({
            success: true,
            message: 'Project added!',
            project: {
                id: result.meta.last_row_id,
                title,
                description,
                tech,
                link,
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
// DELETE /api/projects/:id – Delete a project (password required)
// ============================================================
async function deleteProject(request, env, id) {
    try {
        const body = await request.json();
        const { password } = body;

        // ✅ Password validation happens HERE (safe on the server)
        if (password !== ADMIN_PASSWORD) {
            return Response.json({
                success: false,
                error: 'Unauthorized: Incorrect password',
            }, {
                status: 401,
                headers: corsHeaders,
            });
        }

        // Delete from D1
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
// MAIN REQUEST HANDLER
// ============================================================
export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        const path = url.pathname;

        // Handle OPTIONS (CORS preflight)
        if (request.method === 'OPTIONS') {
            return new Response(null, {
                headers: corsHeaders,
            });
        }

        // GET /api/projects
        if (path === '/api/projects' && request.method === 'GET') {
            return await getProjects(env);
        }

        // POST /api/projects
        if (path === '/api/projects' && request.method === 'POST') {
            return await addProject(request, env);
        }

        // DELETE /api/projects/:id
        if (path.startsWith('/api/projects/') && request.method === 'DELETE') {
            const id = path.split('/')[3]; // Get the ID from URL
            if (!id) {
                return Response.json({
                    success: false,
                    error: 'Missing project ID',
                }, {
                    status: 400,
                    headers: corsHeaders,
                });
            }
            return await deleteProject(request, env, id);
        }

        // 404 – Not Found
        return Response.json({
            error: 'Not found',
        }, {
            status: 404,
            headers: corsHeaders,
        });
    },
};