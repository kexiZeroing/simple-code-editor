"use client";

import Image from "next/image";
import Link from "next/link";

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";

export const Navbar = () => {
  
  return (
    <nav className="flex justify-between items-center gap-x-2 p-2 bg-sidebar border-b">
      <div className="flex items-center gap-x-2">
        <Breadcrumb>
          <BreadcrumbList className="gap-0!">
            <BreadcrumbItem>
              <BreadcrumbLink
                className="flex items-center gap-1.5"
                asChild
              >
                <Button
                  variant="ghost"
                  className="w-fit! p-1.5! h-7!"
                  asChild
                >
                  <Link href="/">
                    <Image
                      src="/globe.svg"
                      alt="Logo"
                      width={20}
                      height={20}
                    />
                    <span className="text-sm font-medium">
                      Demo
                    </span>
                  </Link>
                </Button>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="ml-0! mr-1" />
            <BreadcrumbItem>
                <BreadcrumbPage
                  className="text-sm cursor-pointer hover:text-primary font-medium max-w-40 truncate"
                >
                  project name here
                </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </nav>
  )
};