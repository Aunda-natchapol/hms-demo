import type { Navigation } from "@toolpad/core";
import DashboardIcon from "@mui/icons-material/Dashboard";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import SearchIcon from "@mui/icons-material/Search";
import CleaningServicesIcon from "@mui/icons-material/CleaningServices";
import BuildIcon from "@mui/icons-material/Build";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import SettingsIcon from "@mui/icons-material/Settings";
import AssessmentIcon from "@mui/icons-material/Assessment";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";

export const navigation: Navigation = [
    {
        kind: "header",
        title: "เมนูหลัก",
    },
    {
        segment: "dashboard",
        title: "แดชบอร์ด",
        icon: <DashboardIcon />,
    },
    {
        kind: "divider",
    },
    {
        kind: "header",
        title: "การดำเนินงาน",
    },
    {
        segment: "front-desk",
        title: "แผนกต้อนรับ",
        icon: <HowToRegIcon />,
        children: [
            {
                segment: "rooms",
                title: "จัดการห้องพัก",
                icon: <ArrowRightIcon />,
            },
            {
                segment: "checkin",
                title: "เช็คอิน",
                icon: <ArrowRightIcon />,
            },
            {
                segment: "checkout",
                title: "เช็คเอาท์",
                icon: <ArrowRightIcon />,
            },
            {
                segment: "transfer",
                title: "ย้ายห้องพัก",
                icon: <ArrowRightIcon />,
            },
            {
                segment: "reservations/list",
                title: "การจองห้อง",
                icon: <ArrowRightIcon />,
            },
        ],
    },
    {
        segment: "room-operations",
        title: "การดูแลห้องพัก",
        icon: <HomeWorkIcon />,
        children: [
            {
                segment: "inspection",
                title: "ตรวจสอบห้อง",
                icon: <SearchIcon />,
            },
            {
                segment: "housekeeping",
                title: "งานแม่บ้าน",
                icon: <CleaningServicesIcon />,
            },
            {
                segment: "maintenance",
                title: "งานซ่อมบำรุง",
                icon: <BuildIcon />,
            },
        ],
    },
    {
        kind: "divider",
    },
    {
        kind: "header",
        title: "การจัดการ",
    },
    {
        segment: "settings",
        title: "ตั้งค่าระบบ",
        icon: <SettingsIcon />,
        children: [
            {
                segment: "room-types",
                title: "ประเภทห้องและราคา",
                icon: <ArrowRightIcon />,
            },
            {
                segment: "products",
                title: "ข้อมูลสินค้า",
                icon: <ArrowRightIcon />,
            },
            {
                segment: "damage-masters",
                title: "ประเภทความเสียหาย",
                icon: <ArrowRightIcon />,
            },
            {
                segment: "users",
                title: "ผู้ใช้และสิทธิ์",
                icon: <ArrowRightIcon />,
            },
        ],
    },
    {
        segment: "reports",
        title: "รายงาน",
        icon: <AssessmentIcon />,
        children: [
            {
                segment: "revenue",
                title: "รายงานรายได้",
                icon: <ArrowRightIcon />,
            },
            {
                segment: "occupancy",
                title: "รายงานการเข้าพัก",
                icon: <ArrowRightIcon />,
            },
            {
                segment: "audit",
                title: "บันทึกการใช้งาน",
                icon: <ArrowRightIcon />,
            },
        ],
    },
]; export const BRANDING = {
    title: "Hotel Management System",
    homeUrl: "/dashboard",
};