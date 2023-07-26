import * as Yup from "yup"

export const productValidationSchema = Yup.object({
    name: Yup.string().required("Product name is required"),
    description : Yup.string(),
    price : Yup.string().required("Price is required"),
    categoryId : Yup.string().required("Category is required"),
})

export const categoryValidationSchema = Yup.object({
    name: Yup.string().required("Category is required"),
    parentId : Yup.number(),
})

export const updateProductValidationSchema = Yup.object({
    id: Yup.string().required("id is required"),
    name: Yup.string(),
    description : Yup.string(),
    price : Yup.string(),
    categoryId : Yup.string(),
})

export const updateCategoryValidationSchema = Yup.object({
    id: Yup.number().required("id is required"),
    name: Yup.string(),
    parentId : Yup.number(),
})

