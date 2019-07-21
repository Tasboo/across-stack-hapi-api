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
  Item,
} from 'src/models/Item';
import { getConfig } from '../../config';

const ItemResponseSchema = ItemSchema.keys({
  url: Joi.string().required(),
}).required();
type ItemResponse = Joi.SchemaValue<typeof ItemResponseSchema>;

export const ItemRoutePlugin: Plugin<never> = {
  name: 'Item Routes',
  async register(server) {
    const BASE_ROUTE_URL =
      (getConfig('PUBLIC_DOMAIN') || server.info.uri) + server.realm.modifiers.route.prefix;

    function mapItemToItemResponse(item: Item): ItemResponse {
      return {
        ...item,
        url: BASE_ROUTE_URL + '/' + item.id,
      };
    }

    await server.route({
      method: 'GET',
      path: '/',
      options: {
        tags: ['api'],
        response: {
          schema: Joi.array()
            .items(ItemResponseSchema.optional())
            .required(),
        },
      },
      async handler() {
        return (await getAllItems()).map(mapItemToItemResponse);
      },
    });

    await server.route({
      method: 'GET',
      path: '/{id}',
      options: {
        tags: ['api'],
        response: {
          schema: ItemResponseSchema,
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

        return mapItemToItemResponse(item);
      },
    });

    await server.route({
      method: 'POST',
      path: '/',
      options: {
        tags: ['api'],
        response: {
          schema: ItemResponseSchema,
        },
        validate: {
          payload: ItemDataSchema.required(),
        },
      },
      async handler(request) {
        const item = await createItem(request.payload);
        const forwarded = await server.inject(`${server.realm.modifiers.route.prefix}/${item.id}`);

        return forwarded.result as ItemResponse;
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
