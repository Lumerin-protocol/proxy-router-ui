import '@emotion/react'

declare module '@emotion/react' {
  export interface Theme {
    backgroundColor: {
      primary: string
      positive: string
      negative: string
    }
  }
}