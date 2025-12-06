export type CategoryCreateDto = {
    name: string;
};

export type CategoryUpdateDto = {
    name?: string;
};

export type Category = {
    categoryId: string;
    name: string;
};
