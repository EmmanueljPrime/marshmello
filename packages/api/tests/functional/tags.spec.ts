import testUtils from '@adonisjs/core/services/test_utils';
import { test } from '@japa/runner';

import Project from '#models/project';
import Tag from '#models/tag';
import Todo from '#models/todo';
import User from '#models/user';

test.group('Tags', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction());

  test('it should return the list of tags', async ({ client }) => {
    const user = await User.create({ username: 'test1234', password: 'test1234' });

    const response = await client.get('/tags').loginAs(user);

    response.assertStatus(200);
    response.assertBody([]);
  });

  test('it should create a new tag', async ({ client }) => {
    const baseTag = { name: 'Mon premier tag' };
    const user = await User.create({ username: 'test1234', password: 'test1234' });

    const response = await client
      .post('/tags')
      .json({ name: baseTag.name })
      .loginAs(user);

    response.assertStatus(201);
    response.assertBodyContains({ name: baseTag.name });
  });

  test('it should get a tag by uuid', async ({ client }) => {
    const baseTag = { name: 'Mon premier tag' };
    const user = await User.create({ username: 'test1234', password: 'test1234' });

    const tag = await Tag.create({ name: baseTag.name });

    const response = await client.get(`/tags/${tag.uuid}`).loginAs(user);

    response.assertStatus(200);
    response.assertBodyContains({ uuid: tag.uuid, name: baseTag.name });
  });

  test('it should update a tag and reflect changes on todos', async ({ client }) => {
    const baseTag = { name: 'Ancien tag' };
    const updatedTag = { name: 'Nouveau tag' };

    const user = await User.create({ username: 'test1234', password: 'test1234' });
    const project = await Project.create({ name: 'mon projet', userId: user.id });
    const tag = await Tag.create({ name: baseTag.name });

    const todo = await Todo.create({
      name: 'Todo avec tag',
      description: 'Description du todo',
      projectId: project.id,
      tagId: tag.id, // Associer le tag au Todo
    });

    const response = await client
      .patch(`/tags/${tag.uuid}`)
      .json({ name: updatedTag.name })
      .loginAs(user);

    response.assertStatus(200);
    response.assertBodyContains({ uuid: tag.uuid, name: updatedTag.name });

    // Vérifie que le tag est bien mis à jour dans le Todo
    const updatedTodo = await Todo.findOrFail(todo.id);
    response.assertBodyContains({ tagId: updatedTodo.tagId });
  });

  test('it should delete a tag and remove it from associated todos', async ({ client }) => {
    const baseTag = { name: 'Tag à supprimer' };

    const user = await User.create({ username: 'test1234', password: 'test1234' });
    const project = await Project.create({ name: 'mon projet', userId: user.id });
    const tag = await Tag.create({ name: baseTag.name });

    // Associe un Todo avec ce Tag
    const todo = await Todo.create({
      name: 'Todo lié à un tag',
      description: 'Description du todo',
      projectId: project.id,
      tagId: tag.id,
    });

    const response = await client.delete(`/tags/${tag.uuid}`).loginAs(user);
    response.assertStatus(204);

    // Vérifie que le tag est bien supprimé du Todo
    const updatedTodo = await Todo.findOrFail(todo.id);
    response.assertBodyContains({ tagId: null });
  });

  test('it should return 404 when deleting a non-existent tag', async ({ client }) => {
    const user = await User.create({ username: 'test1234', password: 'test1234' });

    const response = await client.delete('/tags/uuid-invalide').loginAs(user);

    response.assertStatus(404);
  });
});
