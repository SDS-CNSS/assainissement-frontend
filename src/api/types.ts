/** Format d'erreur API uniforme (section 8 du cahier des charges). */
export interface ApiErrorBody {
  error: {
    code: string
    message: string
    fields?: Record<string, string | string[]>
  }
}

export function isApiErrorBody(data: unknown): data is ApiErrorBody {
  if (typeof data !== 'object' || data === null) return false
  const err = (data as ApiErrorBody).error
  return (
    typeof err === 'object' &&
    err !== null &&
    typeof err.code === 'string' &&
    typeof err.message === 'string'
  )
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error
  ) {
    const response = (error as { response?: { status?: number; data?: unknown } })
      .response

    if (response?.status === 429) {
      if (isApiErrorBody(response.data)) {
        return response.data.error.message
      }

      return 'Trop de requêtes. Veuillez patienter quelques instants avant de réessayer.'
    }

    if (response?.data !== undefined && isApiErrorBody(response.data)) {
      const fieldMessages = response.data.error.fields
        ? Object.values(response.data.error.fields).flatMap((value) =>
            Array.isArray(value) ? value : [value],
          )
        : []

      if (fieldMessages.length > 0) {
        return fieldMessages[0]
      }

      return response.data.error.message
    }
  }

  return fallback
}
