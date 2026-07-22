export { AuthProvider } from './AuthProvider'
export { useAuthStore, selectIsAuthenticated, selectMustChangePassword } from './authStore'
export { useChangePassword, useLogin, useLogout, useRefresh } from './hooks'
export {
  GuestOnly,
  RequireAuth,
  RequirePasswordChanged,
  RequireRole,
} from './RequireRole'
export {
  changePasswordSchema,
  countPasswordCharacterClasses,
  firstChangePasswordSchema,
  loginSchema,
  passwordSchema,
} from './schemas'
export type {
  ChangePasswordFormValues,
  FirstChangePasswordFormValues,
  LoginFormValues,
} from './schemas'
export type { AuthUser, SymfonyRole, UserRole } from './types'
export {
  getDefaultBackofficePath,
  ROLE_TO_SYMFONY,
  userHasRole,
} from './types'
