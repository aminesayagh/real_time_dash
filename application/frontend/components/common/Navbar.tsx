'use client';

import React, {  } from "react";
import { Navbar, NavbarBrand, NavbarContent, Link, Button } from '@nextui-org/react';
import Logo from "@/components/ui/logo/Logo";
import { text } from '@ui/typography/Typography.style'; 
import { Lang } from "@/app/i18n/settings";
import { useTranslation } from "@tran/client";

export default function NavbarUi({
    lng
}: {
    lng: Lang;
}) {
    const { t } = useTranslation(lng, 'common');
    return (
        <Navbar isBordered> 
            <NavbarBrand className='flex flex-row justify-start items-center gap-4'>
                <Logo size={40} alt='Logo' mode='dark' href='/' />
                <Link className={text({
                    mode: 'dark',
                    degree: 'normal',
                    weight: 'semibold',
                    size: 'xs'
                })} href={`${lng}/`}>
                    {t('header.logo')}
                </Link>
            </NavbarBrand>
            <NavbarContent className='hidden sm:flex gap4' justify="center">

            </NavbarContent>
            <NavbarContent className='flex gap4' justify="end">
                <Button as={Link} color='primary' href={`${lng}/auth/login`} variant='flat'>
                    {t('header.login')}
                </Button>
            </NavbarContent>
        </Navbar>
    );
}