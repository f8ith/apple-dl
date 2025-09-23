import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: () => null,
  loader: () => {
    redirect({
      to: '/search/$term',
      params: {term: ''},
      throw: true
    })
  }
})
