import * as yup from 'yup'

export type CreateChatRollFormValues = {
  title: string
}

export const createChatRollFormSchema = yup.object({
  title: yup
    .string()
    .trim()
    .required('Title is required')
    .min(1, 'Title must be 1-200 characters')
    .max(200, 'Title must be 1-200 characters'),
})

export type ChatRollWidgetSettingsFormValues = {
  width: number
  height: number
}

export const chatRollWidgetSettingsFormSchema = yup.object({
  width: yup
    .number()
    .typeError('Width must be a number')
    .required('Width is required')
    .integer('Width must be an integer')
    .min(200, 'Width must be 200-2400')
    .max(2400, 'Width must be 200-2400'),
  height: yup
    .number()
    .typeError('Height must be a number')
    .required('Height is required')
    .integer('Height must be an integer')
    .min(200, 'Height must be 200-2400')
    .max(2400, 'Height must be 200-2400'),
})
