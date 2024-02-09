import queryString from 'query-string'

export const objectToQueryString = (obj: Pick<queryString.ParsedQuery<string>, never>, options = {}) =>
  queryString.stringify(obj, {
    arrayFormat: 'bracket',
    ...options
  })
