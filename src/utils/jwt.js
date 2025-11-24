export const decodeTokenPayload = (token) => {
  if (!token) return null
  try {
    const payloadSegment = token.split('.')[1]
    if (!payloadSegment) return null
    const normalized = payloadSegment.replace(/-/g, '+').replace(/_/g, '/')
    const decoded = atob(normalized.padEnd(normalized.length + (4 - (normalized.length % 4)) % 4, '='))
    return JSON.parse(decoded)
  } catch (error) {
    console.error('Failed to decode token payload', error)
    return null
  }
}

export const getUserFromToken = (token) => {
  const payload = decodeTokenPayload(token)
  if (!payload) return null
  return {
    id: payload.userId ?? payload.userID ?? payload.subId ?? null,
    username: payload.sub || payload.username || payload.userName || null,
  }
}


