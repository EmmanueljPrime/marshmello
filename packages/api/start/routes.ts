import router from '@adonisjs/core/services/router';

import { middleware } from '#start/kernel';

const todoController = () => import('#controllers/todo_controller');
const authController = () => import('#controllers/auth_controller');
const accountController = () => import('#controllers/account_controller');
const projectController = () => import('#controllers/project_controller');
const statusController = () => import('#controllers/status_controller');
const tagController = () => import('#controllers/tag_controller');

router
	.group(() => {
		router.post('/login', [authController, 'login']).as('auth.login');
		router.post('/logout', [authController, 'logout']).as('auth.logout').use(middleware.auth());
		router.post('/register', [authController, 'register']).as('auth.register');
		router.get('/check', [authController, 'check']).as('auth.check');
	})
	.prefix('/auth');

router
	.group(() => {
		router.delete('/', [accountController, 'deleteAccount']).as('account.delete');
	})
	.use(middleware.auth())
	.prefix('/account');

router
	.group(() => {
		router.get('/', [projectController, 'index']).as('projects.index');
		router.get('/:uuid', [projectController, 'show']).as('projects.show');
		router.post('/', [projectController, 'store']).as('projects.store');
		router.patch('/:uuid', [projectController, 'update']).as('projects.update');
		router.delete('/:uuid', [projectController, 'destroy']).as('projects.destroy');
	})
	.use(middleware.auth())
	.prefix('/projects');

router
	.group(() => {
		router.get('/list/:projectUuid', [statusController, 'index']).as('statuses.index');
		router.get('/:uuid', [statusController, 'show']).as('statuses.show');
		router.post('/', [statusController, 'store']).as('statuses.store');
		router.patch('/:uuid', [statusController, 'update']).as('statuses.update');
		router.delete('/:uuid', [statusController, 'destroy']).as('statuses.destroy');
	})
	.use(middleware.auth())
	.prefix('/statuses');

router
	.group(() => {
		router.get('/list/:projectUuid', [todoController, 'index']);
		router.post('/', [todoController, 'create']);
		router.get('/:uuid', [todoController, 'show']);
		router.patch('/:uuid', [todoController, 'update']);
		router.delete('/:uuid', [todoController, 'delete']);
	})
	.use(middleware.auth())
	.prefix('/todos');

router
  .group(() => {
    router.get('/', [tagController, 'index'])
    router.get('/:uuid', [tagController, 'show'])
    router.post('/', [tagController, 'create'])
    router.patch('/:uuid', [tagController, 'update'])
    router.delete('/:uuid', [tagController, 'delete'])
  })
  .use(middleware.auth())
  .prefix('/tags');
