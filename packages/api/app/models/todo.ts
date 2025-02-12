import type { BelongsTo } from '@adonisjs/lucid/types/relations';

import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm';
import { DateTime } from 'luxon';
import { v7 } from 'uuid';

import Project from '#models/project';
import Status from '#models/status';
import Tag from '#models/tag';

export default class Todo extends BaseModel {
  static readonly table = 'todos';

  @column({ isPrimary: true })
  declare id: number;

  @column()
  declare uuid: string;

  @column()
  declare name: string;

  @column()
  declare description: string | null;

  @column()
  declare completed: boolean;

  @column()
  declare projectId: number;

  @column()
  declare statusId: number | null;

  @column()
  declare tagId: number | null;

  @belongsTo(() => Project)
  declare project: BelongsTo<typeof Project>;

  @belongsTo(() => Status)
  declare status: BelongsTo<typeof Status>;

  @belongsTo(() => Tag)
  declare tag: BelongsTo<typeof Tag>;

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime;

  constructor() {
    super();
    this.uuid = v7();
    this.completed = false;
    this.description = null;
    this.statusId = null;
    this.tagId = null;
}
