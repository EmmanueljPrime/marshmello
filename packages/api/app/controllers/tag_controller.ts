import type { HttpContext } from '@adonisjs/core/http';

import Tag from '#models/tag';
import { createSchema, updateSchema } from '#validators/tag_validator';

export default class TagsController {

  async index({ auth, response }: HttpContext) {
    if (auth.use('web').isLoggedOut) {
      return response.unauthorized();
    }

    const tags = await Tag.query().preload('todos');
    return response.json(tags);
  }

  async show({ auth, params, response }: HttpContext) {
    if (auth.use('web').isLoggedOut) {
      return response.unauthorized();
    }

    const tag = await Tag.findByOrFail('uuid', params.uuid);
    await tag.load('todos');

    return response.json(tag);
  }

  async create({ auth, request, response }: HttpContext) {
    if (auth.use('web').isLoggedOut) {
      return response.unauthorized();
    }

    const payload = await request.validateUsing(createSchema);
    const tag = await Tag.create(payload);

    return response.created(tag);
  }

  async update({ auth, params, request, response }: HttpContext) {
    if (auth.use('web').isLoggedOut) {
      return response.unauthorized();
    }

    const tag = await Tag.findByOrFail('uuid', params.uuid);
    const payload = await request.validateUsing(updateSchema);

    await tag.merge(payload).save();
    await tag.load('todos');

    return response.json(tag);
  }

  async delete({ auth, params, response }: HttpContext) {
    if (auth.use('web').isLoggedOut) {
      return response.unauthorized();
    }

    const tag = await Tag.findByOrFail('uuid', params.uuid);
    await tag.delete();

    return response.noContent();
  }
}
