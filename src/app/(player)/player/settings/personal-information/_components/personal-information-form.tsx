"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ProfileApiResponse } from "./personal-information-data-type";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

const formSchema = z.object({
  gender: z.string().min(1, "Please select an option"),
  fullName: z.string().min(2, {
    message: "Full Name must be at least 2 characters.",
  }),
  phone: z.string().min(9, {
    message: "Phone Number must be at least 9 characters.",
  }),
   email: z
    .string()
    .email("Please enter a valid email address")
    .min(2, { message: "Email must be at least 2 characters." }),
  country: z.string().min(2, {
    message: "Country must be at least 2 characters.",
  }),
  sportNationalId: z.string().min(2, {
    message: "Sport National Id must be at least 2 characters.",
  }),
  handicap: z.string().min(1, {
    message: "Handicap Index must be at least 1 characters.",
  }),
  whsNumber: z.string().min(1, {
    message: "Whs Number must be at least 1 characters.",
  }),
});

const PersonalInformationForm = () => {
  const session = useSession();
  const token = (session?.data?.user as { accessToken: string })?.accessToken;
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      gender: "",
      fullName: "",
      phone: "",
      country: "",
      sportNationalId: "",
      handicap: "",
      whsNumber: "",
      email:""
    },
  });

  // get api
  const { data } = useQuery<ProfileApiResponse>({
    queryKey: ["personal-info"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/profile`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return await res.json();
    },

    enabled: !!token,
  });

  console.log(data);

  useEffect(() => {
    if (data?.data) {
      form.reset({
        fullName: data?.data?.fullName,
        phone: data?.data?.phone,
        email: data?.data?.email,
        country: data?.data?.country,
        sportNationalId: data?.data?.sportNationalId,
        handicap: data?.data?.handicap,
        whsNumber: data?.data?.whsNumber,
        gender: data?.data?.gender,
      });
    }
  }, [data, form]);

  // post api

  const { mutate, isPending } = useMutation({
    mutationKey: ["user-profile-update"],
    mutationFn: async (formData: FormData) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/profile`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );
      return await res.json();
    },
    onSuccess: (data) => {
      if (!data?.success) {
        toast.error(data?.message || "Something went wrong");
        return;
      }
      toast.success(data?.message || "Personal Info updated successfull");
      queryClient.invalidateQueries({ queryKey: ["personal-info"] });
      form.reset();
    },
  });


  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    const formData = new FormData();

    formData.append("fullName", values?.fullName);
    formData.append("email", values?.email);
    formData?.append("gender", values?.gender);
    formData?.append("phone", values?.phone);
    formData?.append("country", values?.country);
    formData?.append("sportNationalId", values?.sportNationalId);
    formData?.append("whsNumber", values?.whsNumber);
    formData?.append("handicap", values?.handicap);

    mutate(formData);
  }
  return (
    <div className="px-6">
      <div className="rounded-[16px] border border-[#F3F4F6] bg-white shadow-[0_4px_6px_-4px_rgba(0,0,0,0.10),0_4px_10px_-3px_rgba(0,0,0,0.10)] p-6">
        <h4 className="text-2xl md:text-[28px] lg:text-[32px] text-[#181818] leading-[150%] font-semibold">
          Personal Information
        </h4>
        <p className="text-base text-[#68706A] font-normal leading-[150%]">
          Manage your personal information and profile details.
        </p>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-5 pt-10"
          >
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-base text-[#434C45] leading-[150%] font-medium">
                    Select Gender
                  </FormLabel>

                  <FormControl className="flex items-center gap-6">
                    <RadioGroup
                      value={field.value}
                      onValueChange={field.onChange}
                      className="space-y-0"
                    >
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="male" className="mt-2" />
                        </FormControl>
                        <FormLabel className="cursor-pointer">Male</FormLabel>
                      </FormItem>

                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="female" className="mt-2" />
                        </FormControl>
                        <FormLabel className="cursor-pointer">Female</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>

                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

           

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base text-[#434C45] leading-[150%] font-medium">
                    Full Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="w-full h-[48px] py-2 px-3 rounded-[8px] border border-[#C0C3C1] text-base font-medium leading-[120%] text-[#434C45)]"
                      placeholder="Belah"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base text-[#434C45] leading-[150%] font-medium">
                      Email
                    </FormLabel>
                    <FormControl>
                      <Input
                        
                        className="w-full h-[48px] py-2 px-3 rounded-[8px] border border-[#C0C3C1] text-base font-medium leading-[120%] text-[#434C45)]"
                        placeholder="(555) 123-4567"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base text-[#434C45] leading-[150%] font-medium">
                      Country
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="w-full h-[48px] py-2 px-3 rounded-[8px] border border-[#C0C3C1] text-base font-medium leading-[120%] text-[#434C45)]"
                        placeholder="US"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base text-[#434C45] leading-[150%] font-medium">
                      Phone
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="w-full h-[48px] py-2 px-3 rounded-[8px] border border-[#C0C3C1] text-base font-medium leading-[120%] text-[#434C45)]"
                        placeholder="(555) 123-4567"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sportNationalId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base text-[#434C45] leading-[150%] font-medium">
                      Club Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="w-full h-[48px] py-2 px-3 rounded-[8px] border border-[#C0C3C1] text-base font-medium leading-[120%] text-[#434C45)]"
                        placeholder="Pine Valley Golf Club"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="handicap"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base text-[#434C45] leading-[150%] font-medium">
                      Handicap Index
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="w-full h-[48px] py-2 px-3 rounded-[8px] border border-[#C0C3C1] text-base font-medium leading-[120%] text-[#434C45)]"
                        placeholder="12.4"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="whsNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base text-[#434C45] leading-[150%] font-medium">
                      WHS Number
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="w-full h-[48px] py-2 px-3 rounded-[8px] border border-[#C0C3C1] text-base font-medium leading-[120%] text-[#434C45)]"
                        placeholder="12345698774"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
            </div>

            {/* Buttons */}
            <div className="flex flex-col md:flex-row justify-end gap-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}
                className="h-[49px] text-[#929292] text-lg font-medium leading-[150%] border-[1px] border-[#929292] rounded-[8px] py-3 px-4 md:px-16"
              >
                Discard Changes
              </Button>
              <Button
                disabled={isPending}
                type="submit"
                className="h-[49px] bg-gradient-to-b from-[#DF1020] to-[#310000]
            hover:from-[#310000] hover:to-[#DF1020]
            transition-all duration-300 text-[#F7F8FA] font-bold text-lg leading-[120%] rounded-[8px] px-4 md:px-12"
              >
                {isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default PersonalInformationForm;
