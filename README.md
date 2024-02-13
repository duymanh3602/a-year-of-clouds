# a-year-of-clouds
"Khai Code" xuân mới ^^

Authentication built on top of Supabase Auth

Deployed on Cloudflare Workers and Cloudflare Pages

Product: updating!

------------------

Test API bằng Postman

Tạo Global Variable tên {{accessToken}}

Tạo API tên login, gọi tới API: ../api/v1/login

Nhập body cho API là account test

```
{
    "email": "",
    "password": ""
}
```

Ở phần Tests, thêm đoạn code sau:

```
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

const res = pm.response.json();

pm.globals.set("accessToken", res);
```

Chạy API này mỗi lần test, token sẽ được lưu tự động

Các API khác chỉ cần set type của Authorization với kiểu Bearer Token

-------------------