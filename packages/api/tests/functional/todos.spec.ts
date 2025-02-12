import testUtils from '@adonisjs/core/services/test_utils';
import { test } from '@japa/runner';

import Project from '#models/project';
import Status from '#models/status';
import Todo from '#models/todo';
import User from '#models/user';
import Tag from '#models/tag';

test.group('Todos', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction());

  test('it should return the list of todos', async ({ client }) => {
    const user = await User.create({ username: 'test1234', password: 'test1234' });
    const project = await Project.create({ name: 'mon projet', userId: user.id });

    const response = await client.get(`/todos/list/${project.uuid}`).loginAs(user);

    response.assertStatus(200);
    response.assertBody([]);
  });

  test('it should create a new todo', async ({ client }) => {
    const baseTodo = {
      name: 'ma première todo',
      description: 'lorem ipsum dolor sit amet.',
    };

    const user = await User.create({ username: 'test1234', password: 'test1234' });
    const project = await Project.create({ name: 'mon projet', userId: user.id });
    const status = await Status.create({ name: 'done', order: 1, projectId: project.id });

    const response = await client
      .post('/todos')
      .json({
        name: baseTodo.name,
        description: baseTodo.description,
        statusId: status.id,
        projectId: project.id,
      })
      .loginAs(user);

    response.assertStatus(201);
    response.assertBodyContains({
      name: baseTodo.name,
      description: baseTodo.description,
      completed: false,
      projectId: project.id,
      statusId: status.id,
      tagId: null,
    });
  });

  test('it should get a todo by id', async ({ client }) => {
    const user = await User.create({ username: 'test1234', password: 'test1234' });
    const project = await Project.create({ name: 'mon projet', userId: user.id });
    const status = await Status.create({ name: 'done', order: 1, projectId: project.id });
    const todo = await Todo.create({
      name: 'ma première todo',
      description: 'lorem ipsum dolor sit amet.',
      projectId: project.id,
      statusId: status.id,
      tagId: null,
    });

    const response = await client.get(`/todos/${todo.uuid}`).loginAs(user);

    response.assertStatus(200);
    response.assertBodyContains({
      uuid: todo.uuid,
      name: todo.name,
      description: todo.description,
      completed: false,
      projectId: project.id,
      statusId: status.id,
      tagId: null,
    });
  });

  test('it should create a new todo with a tag', async ({ client }) => {
    const user = await User.create({ username: 'test1234', password: 'test1234' });
    const project = await Project.create({ name: 'mon projet', userId: user.id });
    const status = await Status.create({ name: 'done', order: 1, projectId: project.id });
    const tag = await Tag.create({ name: 'Urgent' });

    const response = await client
      .post('/todos')
      .json({
        name: 'todo avec tag',
        description: 'un todo avec un tag associé',
        statusId: status.id,
        projectId: project.id,
        tagId: tag.uuid,
      })
      .loginAs(user);

    response.assertStatus(201);
    response.assertBodyContains({
      name: 'todo avec tag',
      description: 'un todo avec un tag associé',
      tagId: tag.id,
    });
  });

  test('it should return a 400 error if the tag does not exist', async ({ client }) => {
    const user = await User.create({ username: 'test1234', password: 'test1234' });
    const project = await Project.create({ name: 'mon projet', userId: user.id });
    const status = await Status.create({ name: 'pending', order: 1, projectId: project.id });

    const response = await client
      .post('/todos')
      .json({
        name: 'todo invalide',
        description: 'un todo avec un tag inexistant',
        statusId: status.id,
        projectId: project.id,
        tagId: 'uuid-invalide', // ❌ UUID inexistant
      })
      .loginAs(user);

    response.assertStatus(400);
    response.assertBodyContains({
      errors: [{ message: 'Le tag sélectionné n’existe pas' }],
    });
  });

  test('it should update a todo and associate a tag', async ({ client }) => {
    const user = await User.create({ username: 'test1234', password: 'test1234' });
    const project = await Project.create({ name: 'mon projet', userId: user.id });
    const status = await Status.create({ name: 'in progress', order: 1, projectId: project.id });
    const todo = await Todo.create({ name: 'todo sans tag', projectId: project.id, statusId: status.id });
    const tag = await Tag.create({ name: 'Important' });

    const response = await client
      .patch(`/todos/${todo.uuid}`)
      .json({ tagId: tag.uuid })
      .loginAs(user);

    response.assertStatus(200);
    response.assertBodyContains({
      uuid: todo.uuid,
      tagId: tag.id,
    });
  });

  test('it should update a todo and remove its tag', async ({ client }) => {
    const user = await User.create({ username: 'test1234', password: 'test1234' });
    const project = await Project.create({ name: 'mon projet', userId: user.id });
    const status = await Status.create({ name: 'todo', order: 1, projectId: project.id });
    const tag = await Tag.create({ name: 'A faire' });
    const todo = await Todo.create({
      name: 'todo avec tag',
      projectId: project.id,
      statusId: status.id,
      tagId: tag.id,
    });

    const response = await client
      .patch(`/todos/${todo.uuid}`)
      .json({ tagId: null })
      .loginAs(user);

    response.assertStatus(200);
    response.assertBodyContains({
      uuid: todo.uuid,
      tagId: null,
    });
  });

  test('it should delete a todo', async ({ client }) => {
    const user = await User.create({ username: 'test1234', password: 'test1234' });
    const project = await Project.create({ name: 'mon projet', userId: user.id });
    const status = await Status.create({ name: 'done', order: 1, projectId: project.id });
    const todo = await Todo.create({ name: 'todo à supprimer', projectId: project.id, statusId: status.id });

    const response = await client.delete(`/todos/${todo.uuid}`).loginAs(user);
    response.assertStatus(204);
  });
});
