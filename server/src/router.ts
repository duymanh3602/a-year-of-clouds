import { Router } from 'itty-router';
import { CONFIG } from './config/config.local';
import { createClient } from '@supabase/supabase-js';

const router = Router();
const admin = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_API_KEY);

router.get(`${CONFIG.API_PREFIX}/my-chat-list`, async (request) => {	
	const { data, error } = await admin.from('chat_accept').select('*').eq('from_id', request.user.id);
	if (error) {
		return new Response(JSON.stringify(error), { status: 500 });
	}
	return new Response(JSON.stringify(data), { status: 200 });
});

// is_accepted => null: chưa chấp nhận, true: đã chấp nhận, false: từ chối
router.get(`${CONFIG.API_PREFIX}/create-new-chat/:id`, async (request) => {
	const from_user_id = request.user.id;
	const new_chat_request = {
		from_id: from_user_id,
		receive_id: request.params.id,
	}
	const isExist = await admin.from('chat_accept')
		.select('*')
		.eq('from_id', from_user_id)
		.eq('receive_id', request.params.id);
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
		.update({ is_accepted: request.query.is_accepted })
		.eq('receive_id', request.user.id)
		.eq('id', request.params.id)
	if (error) {
		return new Response(JSON.stringify(error), { status: 500 });
	}
	return new Response(JSON.stringify(data), { status: 200 });
});

router.post(`${CONFIG.API_PREFIX}/send-message`, async (request) => {
	const content = request.body;
	const new_message = {
		connect_id: content.connect_id,
		content: content.content,
	}
	const { data, error} = await admin.from('chat_accept')
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
	const { data: message, error: messageError } = await admin.from('message_content')
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

// router.post(`${CONFIG.API_PREFIX}/update-accept`, async (request) => {
// 	const content = await request.json();
// 	return new Response('Creating Todo: ' + JSON.stringify(content));
// });


router.all('*', () => new Response('Not Found.', { status: 404 }));

export default router;
