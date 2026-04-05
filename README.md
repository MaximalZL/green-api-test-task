# GREEN-API DevOps Test Task

Тестовое задание для вакансии DevOps / системного инженера в GREEN-API.

Сделал решение как простую статическую страницу.
Поддерживаются методы из задания:

- `getSettings`
- `getStateInstance`
- `sendMessage`
- `sendFileByUrl`

`idInstance` и `ApiTokenInstance` вводятся вручную на странице, как и требуется по ТЗ. Для `sendFileByUrl` имя файла берется из URL.

## Структура

```text
.
├── .github/workflows/deploy-pages.yml
├── docs/
├── site/
│   ├── index.html
│   ├── main.js
│   ├── styles.css
│   ├── assets/
│   └── js/
│       ├── config/app-config.js
│       ├── pages/green-api-page.js
│       ├── services/green-api-client.js
│       ├── services/theme-manager.js
│       └── state/form-history.js
├── .env.example
├── .gitignore
├── docker-compose.yml
├── Dockerfile
└── nginx.conf
```

## Локальный запуск

### Через Docker Compose

```bash
docker compose up --build
```

После запуска по умолчанию страница будет доступна на `http://localhost:8080`.

### Без Docker

Можно просто открыть `site/index.html`.

## Ссылки на документацию

- [GetSettings](https://green-api.com/en/docs/api/account/GetSettings/)
- [GetStateInstance](https://green-api.com/en/docs/api/account/GetStateInstance/)
- [SendMessage](https://green-api.com/en/docs/api/sending/SendMessage/)
- [SendFileByUrl](https://green-api.com/en/docs/api/sending/SendFileByUrl/)
