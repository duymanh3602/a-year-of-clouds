import { Router } from 'itty-router';
import { CONFIG } from './config/config.local';
import { User, createClient } from '@supabase/supabase-js';

const router = Router();

const admin = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_API_KEY);

// Login API for Postman Automation JWT Add for Testing
router.post(`${CONFIG.API_PREFIX}/login`, async (request) => {
	const body = await request.json();
	const email = body.email;
	const password = body.password;
	const { data, error } = await admin.auth.signInWithPassword({ email, password });
	if (error) {
		return new Response(JSON.stringify(error), { status: 500 });
	}
	return new Response(JSON.stringify(data.session.access_token), { status: 200 });
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
		.or(`receive_id.eq.${request.user.id}, from_id.eq.${request.user.id}`);
	if (isExist.data && isExist.data.length > 0) {
		return new Response('EXISTED', { status: 200 });
	}
	const { data, error } = await admin
		.from('chat_accept')
		.insert([new_chat_request])
  		.select()
	if (error) {
		return new Response(JSON.stringify(error), { status: 500 });
	}
	return new Response(JSON.stringify(data), { status: 200 });
});

router.get(`${CONFIG.API_PREFIX}/update-accept-chat/:id`, async (request) => {	
	const { data, error } = await admin
		.from('chat_accept')
		.update({ is_accepted: request.query.status })
		.eq('id', request.params.id)
		.eq('receive_id', request.user.id)
		
	if (error) {
		return new Response(JSON.stringify(error), { status: 500 });
	}
	return new Response(JSON.stringify(data), { status: 200 });
});

router.get(`${CONFIG.API_PREFIX}/get-chat-confirm/:id`, async (request) => {
	const { data, error } = await admin
		.from('chat_accept')
		.select('is_accepted')
		.eq('id', request.params.id)
	if (error) {
		return new Response(JSON.stringify(error), { status: 500 });
	}
	return new Response(JSON.stringify(data), { status: 200 });
});

router.post(`${CONFIG.API_PREFIX}/send-message`, async (request) => {
	const content = await request.json();
	const new_message = {
		connect_id: content.connect_id,
		content: content.content,
	}
	const { data, error} = await admin
		.from('chat_accept')
		.select('*')
		.eq('id', content.connect_id);
	if (error) {
		return new Response(JSON.stringify(error), { status: 500 });
	}
	if (data.length === 0 || (data[0].from_id !== request.user.id && data[0].receive_id !== request.user.id)) {
		return new Response('Forbidden', { status: 403 });
	}
	if (data[0].is_accepted === false) {
		return new Response('Forbidden by blocked', { status: 403 });
	}
	const { data: message, error: messageError } = await admin
		.from('message_content')
		.insert([new_message])
		.select();
	if (messageError) {
		return new Response(JSON.stringify(messageError), { status: 500 });
	}
	return new Response(JSON.stringify(message), { status: 200 });
});

router.get(`${CONFIG.API_PREFIX}/seen-message/:id`, async (request) => {
	const { data, error } = await admin
		.from('message_content')
		.update({ is_seen: true })
		.eq('id', request.params.id)
	if (error) {
		return new Response(JSON.stringify(error), { status: 500 });
	}
	return new Response(JSON.stringify(data), { status: 200 });
});

router.get(`${CONFIG.API_PREFIX}/get-conversation/:id`, async (request) => {
	const { data, error } = await admin
		.from('message_content')
		.select('*')
		.eq('connect_id', request.params.id);
	if (error) {
		return new Response(JSON.stringify(error), { status: 500 });
	}
	return new Response(JSON.stringify(data), { status: 200 });
});

router.get(`${CONFIG.API_PREFIX}/get-conversation-list`, async (request) => {
	const { data, error } = await admin
		.from('chat_accept')
		.select('*')
		.or(`receive_id.eq.${request.user.id}, from_id.eq.${request.user.id}`)
	if (error) {
		return new Response(JSON.stringify(error), { status: 500 });
	}
	return new Response(JSON.stringify(data), { status: 200 });	
});

router.get(`${CONFIG.API_PREFIX}/get-find-user`, async (request) => {
	const regex = request.query.find?.toString() ?? '';
	if (regex.length < 3) {
		return new Response('Finding word must have at least 3 characters', { status: 400 });
	}
	const { data, error } = await admin.auth.admin.listUsers();
	if (error) {
		return new Response(JSON.stringify(error), { status: 500 });
	}
	const filter = data.users?.filter((user: User) =>
		user.email?.includes(regex),
	);
	const res = filter.map((user) => {
		return {
			id: user.id,
			name: user.user_metadata.full_name ?? user.email,
			avatar_url: user.user_metadata.avatar_url ?? null,
		};
	});
	return new Response(JSON.stringify(res), { status: 200 });
});

// router.post(`${CONFIG.API_PREFIX}/update-accept`, async (request) => {
// 	const content = await request.json();
// 	return new Response('Creating Todo: ' + JSON.stringify(content));
// });

router.all('*', () => new Response('Not Found.', { status: 404 }));

export default router;
