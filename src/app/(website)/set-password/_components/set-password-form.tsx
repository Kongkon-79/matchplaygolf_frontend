"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { useSearchParams } from "next/navigation"

const formSchema = z
    .object({
        password: z
            .string()
            .min(6, {
                message: "Password must be at least 6 characters",
            }),
        confirmPassword: z
            .string()
            .min(6, {
                message: "Confirm password is required",
            }),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    })




const SetPasswordForm = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    console.log(token)
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            password: "",
            confirmPassword: ""
        },
    })


    const { mutate, isPending } = useMutation({
        mutationKey: ["set-password"],
        mutationFn: async (payload: { password: string, token: string }) => {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/set-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            })
            return res.json()
        },
        onSuccess: (data) => {
            if (!data?.success) {
                toast.error(data?.message || "Something went wrong!");
                return;
            }
            toast.success(data?.message || "set password Successfully");
            form.reset()
            router.push('/login')
        }
    })


    // 2. Define a submit handler.
    function onSubmit(values: z.infer<typeof formSchema>) {
        console.log(values)
        if (!token) {
            toast.error("Invalid or expired token")
            return
        }

        mutate({
            password: values.password,
            token,
        })
    }
    return (
        <div className="container">
            <Form {...form} >
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full md:w-2/3 mx-auto">
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-lg font-semibold text-[#333333] leading-[120%]">Password *</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Input type={showPassword ? "text" : "password"} className="h-[52px] rounded-[10px] border border-[#C0C3C1] text-[#333333] placeholder:text-[#8E938F] font-medium leading-[120%] text-base" placeholder="**************" {...field} />
                                        <button type="button" className="absolute right-4 top-3">{showPassword ? <Eye onClick={() => setShowPassword(!showPassword)} /> : <EyeOff onClick={() => setShowPassword(!showPassword)} />}</button>
                                    </div>
                                </FormControl>
                                <FormMessage className="text-red-500" />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-lg font-semibold text-[#333333] leading-[120%]">Confirm Password *</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Input type={showConfirmPassword ? "text" : "password"} className="h-[52px] rounded-[10px] border border-[#C0C3C1] text-[#333333] placeholder:text-[#8E938F] font-medium leading-[120%] text-base" placeholder="**************" {...field} />
                                        <button type="button" className="absolute right-4 top-3">{showConfirmPassword ? <Eye onClick={() => setShowConfirmPassword(!showConfirmPassword)} /> : <EyeOff onClick={() => setShowConfirmPassword(!showConfirmPassword)} />}</button>
                                    </div>

                                </FormControl>
                                <FormMessage className="text-red-500" />
                            </FormItem>
                        )}
                    />
                  <div className="w-full flex items-center justify-center pt-4">
                      <Button className="h-[52px] px-10 rounded-[10px] text-base leading-[120%] font-medium" disabled={isPending} type="submit">{isPending ? "Changing...." : "Setup Your Password"}</Button>
                  </div>
                </form>
            </Form>
        </div>
    )
}

export default SetPasswordForm