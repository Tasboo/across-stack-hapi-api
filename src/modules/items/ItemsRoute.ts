import Joi from "joi";
import { ServerRegisterPluginObject } from "hapi";
import { ItemSchema, getAllItems,
  // getItemById, createItem, updateItem, deleteItem
} from "src/models/Item";

export const ItemRoutePlugin: ServerRegisterPluginObject<never> = {
  plugin: {
    name: "Item Routes",
    async register(server) {

      await server.route({
        method: "GET",
        path: "/",
        options: {
          response: {
            schema: Joi.array().items(ItemSchema.optional()).required()
          }
        },
        async handler() {
          return getAllItems();
        }
      });
    }
  }
};