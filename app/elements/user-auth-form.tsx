import { HTMLAttributes, useState } from 'react'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import {
  Link,
  // useFetcher,
  // json,
  // useLoaderData,
  // useActionData,
} from '@remix-run/react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
// import { IconBrandFacebook, IconBrandGithub } from '@tabler/icons-react'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/custom/button'
import { PasswordInput } from '@/components/custom/password-input'
import { cn } from '@/lib/utils'
// import { ActionFunctionArgs, redirect } from '@remix-run/node'

interface UserAuthFormProps extends HTMLAttributes<HTMLDivElement> {}
type LognErrorSchema = {
  data: {
    message: string
  }
  statusCode: number
  error: string
}

// handle form submission
const formSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Please enter your email' })
    .email({ message: 'Invalid email address' }),
  password: z
    .string()
    .min(1, {
      message: 'Please enter your password',
    })
    .min(7, {
      message: 'Password must be at least 7 characters long',
    }),
})

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    try {
      // e.preventDefault()
      setIsLoading(true)
      console.log(data)
      const res = await fetch(`${window.ENV?.BACKEND_URL}/api/v1/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const error = await res.json() as LognErrorSchema
        throw new Error(error.data.message)
      }
      setIsLoading(false)
    }
    catch (error) {
      console.log(error)
      // if it is a type of error
      if (error instanceof Error) {
        console.error(error)
        toast.error(error.message)
      }
      // else toast.error('something went wrong, please try again')
      setIsLoading(false)
    }
  }

  return (
    <div className={cn('grid gap-6', className)} {...props}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className='grid gap-2'>
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem className='space-y-1'>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder='name@example.com' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='password'
              render={({ field }) => (
                <FormItem className='space-y-1'>
                  <div className='flex items-center justify-between'>
                    <FormLabel>Password</FormLabel>
                    <Link
                      to='/forgot-password'
                      className='text-sm font-medium text-muted-foreground hover:opacity-75'
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <FormControl>
                    <PasswordInput placeholder='********' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button className='mt-2' loading={isLoading}>
              Login
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
