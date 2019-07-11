import Joi from 'joi';
import Boom from '@hapi/boom';
import { Plugin } from 'hapi';
import {
  ItemSchema,
  getAllItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  ItemDataSchema,
  deleteAllItems,
} from 'src/models/Item';

export const ItemRoutePlugin: Plugin<never> = {
    name: 'Item Routes',
    async register(server) {
      await server.route({
        method: 'GET',
        path: '/',
        options: {
          tags: ['api'],
          response: {
            schema: Joi.array()
              .items(ItemSchema.optional())
              .required(),
          },
        },
        async handler() {
          return getAllItems();
        },
      });

      await server.route({
        method: 'GET',
        path: '/{id}',
        options: {
          tags: ['api'],
          response: {
            schema: ItemSchema.required(),
          },
          validate: {
            params: Joi.object({
              id: Joi.number().required(),
            }).required(),
          },
        },
        async handler(request) {
          const { id } = request.params;

          const item = await getItemById(id);
          if (!item) {
            throw Boom.notFound('Item not found!');
          }

          return item;
        },
      });

      await server.route({
        method: 'POST',
        path: '/',
        options: {
          tags: ['api'],
          response: {
            schema: ItemSchema.required(),
          },
          validate: {
            payload: ItemDataSchema.required(),
          },
        },
        async handler(request) {
          const item = await createItem(request.payload);
          return item;
        },
      });

      await server.route({
        method: 'PUT',
        path: '/{id}',
        options: {
          tags: ['api'],
          response: {
            schema: null,
          },
          validate: {
            payload: ItemDataSchema.required(),
            params: Joi.object({
              id: Joi.number().required(),
            }).required(),
          },
        },
        async handler(request) {
          const { id } = request.params;
          await updateItem(id, request.payload);
          return null;
        },
      });

      await server.route({
        method: 'DELETE',
        path: '/{id}',
        options: {
          tags: ['api'],
          response: {
            schema: null,
          },
          validate: {
            params: Joi.object({
              id: Joi.number().required(),
            }).required(),
          },
        },
        async handler(request) {
          const { id } = request.params;
          await deleteItem(id);
          return null;
        },
      });

      /** delete all items */
      await server.route({
        method: 'DELETE',
        path: '/',
        options: {
          tags: ['api'],
          response: {
            schema: null,
          },
        },
        async handler() {
          await deleteAllItems();
          return null;
        },
      });
    },
};
