import { Router } from 'itty-router';
import { CONFIG } from './config/config.local';
import { User, createClient } from '@supabase/supabase-js';

const corsHeaders = { 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Origin':  CONFIG.ORIGIN }

const router = Router();

router.options('*', () => new Response('OK', { status: 200, headers: corsHeaders }));

const admin = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_API_KEY);

// Login API for Postman Automation JWT Add for Testing
router.post(`${CONFIG.API_PREFIX}/login`, async (request) => {
	const body = await request.json();
	const email = body.email;
	const password = body.password;
	const { data, error } = await admin.auth.signInWithPassword({ email, password });
	if (error) {
		return new Response(JSON.stringify(error), { status: 500, headers: corsHeaders });
	}
	return new Response(JSON.stringify(data.session.access_token), { status: 200, headers: corsHeaders });
});

// is_accepted = null: chưa xác nhận, true: đã chấp nhận, false: từ chối
router.get(`${CONFIG.API_PREFIX}/create-new-chat/:id`, async (request) => {
	const from_user_id = request.user.id;
	const new_chat_request = {
		from_id: from_user_id,
		receive_id: request.params.id,
	}
	const isExist = await admin.from('chat_accept')
		.select('*')
		.or(`receive_id.eq.${request.user.id}, from_id.eq.${request.user.id}`)
		.or(`receive_id.eq.${request.params.id}, from_id.eq.${request.params.id}`);
	if (isExist.data && isExist.data.length > 0) {
		return new Response('EXISTED', { status: 200, headers: corsHeaders });
	}
	const { data, error } = await admin
		.from('chat_accept')
		.insert([new_chat_request])
  		.select()
	if (error) {
		return new Response(JSON.stringify(error), { status: 500, headers: corsHeaders });
	}
	return new Response(JSON.stringify(data[0]), { status: 200, headers: corsHeaders });
});

router.get(`${CONFIG.API_PREFIX}/get-is-connected/:id`, async (request) => {
	// id = user_id
	const { data, error } = await admin
		.from('chat_accept')
		.select('*')
		.or(`receive_id.eq.${request.user.id}, from_id.eq.${request.user.id}`)
		.or(`receive_id.eq.${request.params.id}, from_id.eq.${request.params.id}`)
	if (error) {
		return new Response(JSON.stringify(error), { status: 500, headers: corsHeaders });
	}
	if (data.length === 0) {
		return new Response('NOT_CONNECTED', { status: 200, headers: corsHeaders });
	} else {
		return new Response(JSON.stringify(data[0]), { status: 200, headers: corsHeaders });
	}
})

router.get(`${CONFIG.API_PREFIX}/update-accept-chat/:id`, async (request) => {	
	const { data, error } = await admin
		.from('chat_accept')
		.update({ is_accepted: request.query.status })
		.eq('id', request.params.id)
		.eq('receive_id', request.user.id)
		
	if (error) {
		return new Response(JSON.stringify(error), { status: 500, headers: corsHeaders });
	}
	return new Response(JSON.stringify(data), { status: 200, headers: corsHeaders });
});

router.get(`${CONFIG.API_PREFIX}/get-chat-confirm/:id`, async (request) => {
	const { data, error } = await admin
		.from('chat_accept')
		.select('is_accepted')
		.eq('id', request.params.id)
	if (error) {
		return new Response(JSON.stringify(error), { status: 500, headers: corsHeaders });
	}
	return new Response(JSON.stringify(data), { status: 200, headers: corsHeaders });
});

router.post(`${CONFIG.API_PREFIX}/send-message`, async (request) => {
	const content = await request.json();
	const { data, error} = await admin
		.from('chat_accept')
		.select('*')
		.eq('id', content.connect_id);
	if (error) {
		console.log(error);
		
		return new Response(JSON.stringify(error), { status: 500, headers: corsHeaders });
	}
	if (data.length === 0 || (data[0].from_id !== request.user.id && data[0].receive_id !== request.user.id)) {
		return new Response('Forbidden', { status: 403, headers: corsHeaders });
	}
	if (data[0].is_accepted === false) {
		return new Response('Forbidden by blocked', { status: 403, headers: corsHeaders });
	}
	const new_message = {
		send_by_from: data[0].from_id === request.user.id,
		connect_id: content.connect_id,
		content: content.content,
	}
	const { data: message, error: messageError } = await admin
		.from('message_content')
		.insert([new_message])
		.select();

	const { data: update, error: updateError } = await admin.from('chat_accept').update({ last_active: new Date() }).eq('id', content.connect_id);
	
	if (messageError || updateError) {
		console.log(messageError || updateError);
		
		return new Response(JSON.stringify(messageError ?? updateError), { status: 500, headers: corsHeaders });
	}
	return new Response(JSON.stringify(message), { status: 200, headers: corsHeaders });
});

router.get(`${CONFIG.API_PREFIX}/seen-message/:id`, async (request) => {
	const { data, error } = await admin
		.from('message_content')
		.update({ is_seen: true })
		.eq('id', request.params.id)
	if (error) {
		return new Response(JSON.stringify(error), { status: 500, headers: corsHeaders });
	}
	return new Response(JSON.stringify(data), { status: 200, headers: corsHeaders });
});

router.get(`${CONFIG.API_PREFIX}/get-conversation/:id`, async (request) => {
	const { data, error } = await admin
		.from('message_content')
		.select(`id, content, is_seen, sent_date, send_by_from, chat_accept (from_id, receive_id)`)
		.eq('connect_id', request.params.id)
		// .order('sent_date', { ascending: false })
		// .limit(20)
		.order('sent_date', { ascending: true });
	if (error) {
		console.log(error);
		
		return new Response(JSON.stringify(error), { status: 500, headers: corsHeaders });
	}
	return new Response(JSON.stringify(data), { status: 200, headers: corsHeaders });
});

router.get(`${CONFIG.API_PREFIX}/get-conversation-list`, async (request) => {
	const responses: any = [];
	const { data, error } = await admin
		.from('chat_accept')
		.select('*')
		.or(`receive_id.eq.${request.user.id}, from_id.eq.${request.user.id}`)
	const { data: users, error: userError } = await admin.auth.admin.listUsers();
	if (data && data.length !== 0) {
		await Promise.all(data.map(async (item) => {
			let user;
			if (item.from_id === request.user.id) {
				user = users.users?.find((user: User) => user.id === item.receive_id);
			} else {
				user = users.users?.find((user: User) => user.id === item.from_id);
			}
			const response = {
				id: item.id,
				name: user?.user_metadata.full_name ?? user?.email,
				avatar_url: user?.user_metadata.avatar_url ?? 'https://seeklogo.com/images/V/vite-logo-BFD4283991-seeklogo.com.png',
				last_chat: 'Hello world!',
				is_accepted: item.is_accepted,
				receive_id: item.receive_id,
			}
			responses.push(response);
		}))
	}
	
	if (error) {
		return new Response(JSON.stringify(error), { status: 500, headers: corsHeaders });
	}
	return new Response(JSON.stringify(responses), { status: 200, headers: corsHeaders });	
});

router.get(`${CONFIG.API_PREFIX}/get-find-user`, async (request) => {
	const regex = request.query.find?.toString() ?? '';
	if (regex.length < 3) {
		return new Response('Finding word must have at least 3 characters', { status: 400, headers: corsHeaders });
	}
	const { data, error } = await admin.auth.admin.listUsers();
	if (error) {
		return new Response(JSON.stringify(error), { status: 500, headers: corsHeaders });
	}
	const filter = data.users?.filter((user: User) =>
		user.email?.includes(regex),
	);
	const res = filter.map((user) => {
		return {
			id: user.id,
			name: user?.user_metadata.full_name ?? user?.email,
			avatar_url: user?.user_metadata.avatar_url ?? 'https://seeklogo.com/images/V/vite-logo-BFD4283991-seeklogo.com.png',
			last_chat: 'Hello world!',
		};
	});
	return new Response(JSON.stringify(res), { status: 200, headers: corsHeaders });
});

// router.post(`${CONFIG.API_PREFIX}/update-accept`, async (request) => {
// 	const content = await request.json();
// 	return new Response('Creating Todo: ' + JSON.stringify(content));
// });

router.all('*', () => new Response('Not Found.', { status: 404 }));

export default router;
