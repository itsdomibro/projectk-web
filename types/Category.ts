export type CategoryCreateDto = {
  name: string;
  description?: string;
};

export type CategoryUpdateDto = {
  name?: string;
  descripion?: string;
};

export type Category = {
  categoryId: string;
  name: string;
  description?: string;
};
