import apiRouter from './router';
import { createClient } from "@supabase/supabase-js";
import { CONFIG } from './config/config.local';

const corsHeaders = { 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Origin': CONFIG.ORIGIN } 

export default {
  async fetch(request: any) {
    const supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_API_KEY);

    const url = new URL(request.url);
    if (request.method === 'OPTIONS') {
      return new Response('OK', { status: 200, headers: corsHeaders });
    }
    switch (url.pathname) {
      case '/': 
        return new Response('Hello World!!!', { status: 200, headers: corsHeaders})
      case '/health-check':
        return new Response('OK', { status: 200, headers: corsHeaders});
			case '/source':
				return Response.redirect('https://github.com/duymanh3602/a-year-of-clouds')
		}

		if (url.pathname.startsWith('/api/')) {
      // middleware to check if the request has a valid JWT token
      const accept_path = ['/api/v1/login', '/api/register'];
      if (accept_path.includes(url.pathname)) {
        return apiRouter.handle(request);
      }
      const token = request.headers.get('Authorization');
      if (!token) {
        return new Response('Unauthorized', { status: 401, headers: corsHeaders});
      } else {
        if (token.split(' ')[0] !== 'Bearer') {
          return new Response('Wrong JWT format', { status: 401, headers: corsHeaders});
        }
        const { data, error } = await supabase.auth.getUser(token.split(' ')[1] ?? '');
        if (error) {
          return new Response(error.toString(), { status: 401, headers: corsHeaders});
        } else {
          request.user = data.user;
        }
      }
			return apiRouter.handle(request);
		}
    
    return Response.redirect('https://github.com/duymanh3602/a-year-of-clouds')
  },
};