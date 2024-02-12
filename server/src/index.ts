import apiRouter from './router';
import { createClient } from "@supabase/supabase-js";
import { CONFIG } from './config/config.local';

export default {
  async fetch(request: any) {
    const supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_API_KEY);

    const url = new URL(request.url);
    switch (url.pathname) {
      case '/': 
        return new Response('Hello World!!!')
      case '/health-check':
        return new Response('OK', { status: 200 });
			case '/source':
				return Response.redirect('https://github.com/duymanh3602/a-year-of-clouds')
		}

		if (url.pathname.startsWith('/api/')) {
      // middleware to check if the request has a valid JWT token
      const token = request.headers.get('Authorization');
      if (!token) {
        return new Response('Unauthorized', { status: 401 });
      } else {
        if (token.split(' ')[0] !== 'Bearer') {
          return new Response('Wrong JWT format', { status: 401 });
        }
        const { data, error } = await supabase.auth.getUser(token.split(' ')[1] ?? '');
        if (error) {
          return new Response(error.toString(), { status: 401 });
        } else {
          request.user = data.user;
        }
      }
			return apiRouter.handle(request);
		}
    
    return Response.redirect('https://github.com/duymanh3602/a-year-of-clouds')
  },
};