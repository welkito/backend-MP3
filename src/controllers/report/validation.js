import * as Yup from "yup"
import { parse, isDate } from "date-fns";

const today = new Date();

function parseDateString(value, originalValue) {
    const parsedDate = isDate(originalValue)
      ? originalValue
      : parse(originalValue, "yyyy-MM-dd", new Date());
    return parsedDate;
}

export const ReportValidationSchema = Yup.object({
    dateFrom : Yup.date().transform(parseDateString).max(today).required("dateFrom field is required"),
    dateTo : Yup.date().transform(parseDateString).max(today).required("dateTo field is required")
})