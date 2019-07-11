import Joi from 'joi';

export const ItemDataSchema = Joi.object({
  title: Joi.string().required(),
}).label('ItemData').required();

export const ItemSchema = ItemDataSchema.keys({
  id: Joi.number().required(),
  completed: Joi.boolean().required(),
  url: Joi.string().required(),
}).label('Item').required();

export type ItemData = Joi.SchemaValue<typeof ItemDataSchema>;
export type Item = Joi.SchemaValue<typeof ItemSchema>;

let lastId = 0;
let items: Item[] = [];

export async function getAllItems(): Promise<Item[]> {
  return items;
}

export async function getItemById(id: Item['id']): Promise<Item | undefined> {
  return items.find(i => i.id === id);
}

export async function createItem(itemData: ItemData): Promise<Item> {
  const id = ++lastId;

  const newItem = {
    id,
    completed: false,
    url: `/items/${id}`,
    ...itemData,
  };

  items = [...items, newItem];

  return newItem;
}

export async function updateItem(id: Item['id'], itemData: ItemData): Promise<void> {
  items = items.map(i => {
    if (i.id === id) {
      return {
        ...i,
        ...itemData,
      };
    } else {
      return i;
    }
  });
}

export async function deleteItem(id: Item['id']): Promise<void> {
  items = items.filter(i => i.id !== id);
}

export async function deleteAllItems(): Promise<void> {
  items = [];
}
