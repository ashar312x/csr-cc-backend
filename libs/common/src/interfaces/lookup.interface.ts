export interface LookupCreate {
    name: string;
    parent: number | null
}

export interface LookupObject {
    id?: number;
    name?: string;
    parent?: number | null
}

export interface LookUpCategories {
    category: string;
    subCategories: LookupObject[]
}
