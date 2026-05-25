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
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Upload, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ColorPicker } from "@/components/ui/color-picker";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ProfileApiResponse } from "./personal-information-data-type";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

const organizerLogoSchema = z
  .any()
  .optional()
  .refine(
    (val) => {
      if (!val) return true; // optional
      // build/SSR safe guard
      if (typeof File === "undefined") return true;
      return val instanceof File;
    },
    { message: "Invalid file" },
  );

// Updated schema: organizerLogo is optional File instance
const formSchema = z.object({
  gender: z.string().min(1, "Please select an option"),
  newsletterPreference: z.string().min(1, "Please select an option"),
  fullName: z
    .string()
    .min(2, { message: "Full Name must be at least 2 characters." }),
  phone: z
    .string()
    .min(9, { message: "Phone Number must be at least 9 characters." }),
  country: z.string().min(1, {
    message: "Countery Name is required.",
  }),
  sportNationalId: z.string().min(1, {
    message: "Sport Name is required.",
  }),
  clubName: z
    .string()
    .min(2, { message: "Club Name must be at least 2 characters." }),
  handicap: z
    .string()
    .min(2, { message: "Handicap Index must be at least 2 characters." }),
  whsNumber: z
    .string()
    .min(2, { message: "Whs Number must be at least 2 characters." }),
  dob: z.union([z.date(), z.string()]),
  // organizerLogo: z.instanceof(File).optional(),
  organizerLogo: organizerLogoSchema,
  color: z.string().min(6, { message: "Please pick a background color." }),
});

type FormValues = z.infer<typeof formSchema>;

const PersonalInformationForm = () => {
  const session = useSession();
  const token = (session?.data?.user as { accessToken: string })?.accessToken;
  const queryClient = useQueryClient();

  // previewImage is always a string URL (data: or http(s):) or null
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      gender: "",
      newsletterPreference: "",
      fullName: "",
      clubName: "",
      phone: "",
      country: "",
      sportNationalId: "",
      handicap: "",
      whsNumber: "",
      dob: new Date(),
      organizerLogo: undefined,
      color: "#000000",
    },
  });

  // Fetch profile data
  const { data } = useQuery<ProfileApiResponse>({
    queryKey: ["personal-info"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/profile`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return res.json();
    },
    enabled: !!token,
  });

  // Populate form and preview when data loads
  useEffect(() => {
    if (data?.data) {
      const profile = data.data;
      form.reset({
        fullName: profile.fullName || "",
        phone: profile.phone || "",
        clubName: profile.clubName || "",
        country: profile.country || "",
        dob: profile.dob ? new Date(profile.dob) : new Date(),
        sportNationalId: profile.sportNationalId || "",
        handicap: profile.handicap || "",
        whsNumber: profile.whsNumber || "",
        gender: profile.gender || "",
        newsletterPreference: profile.newsletterPreference || "",
        color: profile.color || "#000000",
        organizerLogo: undefined, // We don't preload File, only URL for preview
      });

      // Set preview from server URL (should be absolute URL or /uploads/...)
      setPreviewImage(profile.organizerLogo || null);
    }
  }, [data, form]);

  // Handle file selection and generate preview
  const handleImageChange = (file?: File) => {
    if (!file) {
      setPreviewImage(null);
      form.setValue("organizerLogo", undefined);
      return;
    }

    // Generate data URL for instant preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Store the actual File in form
    form.setValue("organizerLogo", file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      handleImageChange(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  // Update profile mutation
  const { mutate, isPending } = useMutation({
    mutationKey: ["user-profile-update"],
    mutationFn: async (formData: FormData) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/profile`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        },
      );
      return await res.json();
    },
    onSuccess: (response) => {
      if (!response?.success) {
        toast.error(response?.message || "Something went wrong");
        return;
      }
      toast.success(response?.message || "Personal Info updated successfully");

      // Invalidate and refetch fresh data (including new image URL)
      queryClient.invalidateQueries({ queryKey: ["personal-info"] });
    },
    onError: () => {
      toast.error("Failed to update profile");
    },
  });

  // Submit handler
  function onSubmit(values: FormValues) {
    const formData = new FormData();

    const localDate = new Date(values.dob as Date);
    const formattedDate = `${localDate.getFullYear()}-${String(localDate.getMonth() + 1).padStart(2, "0")}-${String(localDate.getDate()).padStart(2, "0")}`;

    formData.append("fullName", values.fullName);
    formData.append("gender", values.gender);
    formData.append("clubName", values.clubName);
    formData.append("phone", values.phone);
    formData.append("country", values.country);
    formData.append("color", values.color);
    formData.append("dob", formattedDate);
    formData.append("sportNationalId", values.sportNationalId);
    formData.append("whsNumber", values.whsNumber);
    formData.append("handicap", values.handicap);
    formData.append("newsletterPreference", values.newsletterPreference);

    // Only append file if a new one was selected
    // if (values.organizerLogo instanceof File) {
    //   formData.append("organizerLogo", values.organizerLogo);
    // }

    if (
      values.organizerLogo &&
      typeof File !== "undefined" &&
      values.organizerLogo instanceof File
    ) {
      formData.append("organizerLogo", values.organizerLogo);
    }

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
                          <RadioGroupItem value="Male" className="mt-2" />
                        </FormControl>
                        <FormLabel className="cursor-pointer">Male</FormLabel>
                      </FormItem>

                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="Female" className="mt-2" />
                        </FormControl>
                        <FormLabel className="cursor-pointer">Female</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>

                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base text-[#434C45] leading-[150%] font-medium">
                      Country
                    </FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full h-[48px] py-2 px-3 rounded-[8px] border border-[#C0C3C1] text-base font-medium leading-[120%] text-[#434C45)]">
                          <SelectValue placeholder="Select Country" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="England">England</SelectItem>
                          <SelectItem value="Ireland">Ireland</SelectItem>
                          <SelectItem value="Scotland">Scotland</SelectItem>
                          <SelectItem value="Wales">Wales</SelectItem>
                          <SelectItem value="Europe">Europe</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dob"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base text-[#434C45] leading-[150%] font-medium">
                      Date of Birth
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={`w-full justify-start text-left h-12 ${
                              !field.value && "text-muted-foreground"
                            }`}
                          >
                            {field.value
                              ? format(field.value, "MMM dd, yyyy")
                              : "Pick date"}
                            <CalendarIcon className="ml-auto h-4 w-4" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={
                            typeof field.value === "string"
                              ? new Date(field.value)
                              : field.value
                          }
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="clubName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base text-[#434C45] leading-[150%] font-medium">
                      Golf Club
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="w-full h-[48px] py-2 px-3 rounded-[8px] border border-[#C0C3C1] text-base font-medium leading-[120%] text-[#434C45)]"
                        placeholder="Enter your club name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="sportNationalId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base text-[#434C45] leading-[150%] font-medium">
                      Sport
                      {/* <span className="text-red-500">*</span> */}
                    </FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full h-[48px] py-2 px-3 rounded-[8px] border border-[#C0C3C1] text-base font-medium leading-[120%] text-[#434C45)]">
                          <SelectValue placeholder="Golf" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Golf">Golf</SelectItem>
                          <SelectItem value="Football">Football</SelectItem>
                          <SelectItem value="Tennis">Tennis</SelectItem>
                        </SelectContent>
                      </Select>
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

            {/* === Image Upload === */}
            <FormField
              control={form.control}
              name="organizerLogo"
              render={() => (
                <FormItem>
                  <FormLabel>Image Upload</FormLabel>
                  <FormControl>
                    <div className="relative">
                      {!previewImage ? (
                        <div
                          className={`h-[160px] border-2 border-dashed rounded-[10px] p-8 text-center cursor-pointer transition-colors ${
                            isDragOver
                              ? "border-blue-400 bg-blue-50"
                              : "border-gray-300"
                          }`}
                          onDrop={handleDrop}
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onClick={() =>
                            document.getElementById("image-upload")?.click()
                          }
                        >
                          <div className="flex flex-col items-center justify-center h-full space-y-3">
                            <Upload className="w-10 h-10 text-gray-400" />
                            <p className="text-base text-[#707070]">
                              Drag and drop image here, <br /> or click to add
                              image
                            </p>
                          </div>
                          <input
                            id="image-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) =>
                              handleImageChange(e.target.files?.[0])
                            }
                          />
                        </div>
                      ) : (
                        <div className="relative">
                          <Image
                            width={292}
                            height={160}
                            src={previewImage}
                            alt="Preview"
                            className="w-full h-[160px] object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => handleImageChange(undefined)}
                            className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md"
                          >
                            <X className="h-4 w-4 text-gray-600" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              document.getElementById("image-upload")?.click()
                            }
                            className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow-md"
                          >
                            <Upload className="h-4 w-4 text-gray-600" />
                          </button>
                          <input
                            id="image-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) =>
                              handleImageChange(e.target.files?.[0])
                            }
                          />
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* === Color Picker === */}
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Color</FormLabel>
                  <FormControl>
                    <ColorPicker
                      selectedColor={field.value}
                      onColorChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* === Newsletter Preference === */}
            <FormField
              control={form.control}
              name="newsletterPreference"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <RadioGroup
                      value={field.value}
                      onValueChange={field.onChange}
                      className="space-y-3"
                    >
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="subscribe" />
                        </FormControl>
                        <FormLabel className="cursor-pointer font-normal">
                          Subscribe to our newsletter
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="unsubscribe" />
                        </FormControl>
                        <FormLabel className="cursor-pointer font-normal">
                          Unsubscribe from our newsletter
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* === Buttons === */}
            <div className="flex justify-end gap-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}
                className="h-[49px] text-[#929292] text-lg font-medium border-[#929292]"
              >
                Discard Changes
              </Button>
              <Button
                disabled={isPending}
                type="submit"
                className="h-[49px] bg-gradient-to-b from-[#DF1020] to-[#310000] hover:from-[#310000] hover:to-[#DF1020] text-white font-bold text-lg px-12"
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
