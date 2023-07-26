import * as Yup from "yup"

export const TransactionValidationSchema = Yup.object({
    paymentTypeId : Yup.number().required("Payment type is required"),
    details : Yup.array().required("Detail of transactions are required")
})