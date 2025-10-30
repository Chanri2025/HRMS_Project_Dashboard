// src/Component/Menu/menuConfig.jsx
import {
    MdManageSearch,
    MdWork,
    MdOutlineSpellcheck,
    MdPresentToAll,
    MdFormatListBulletedAdd,
    MdIncompleteCircle,
} from "react-icons/md";
import {FaUserPlus} from "react-icons/fa";
import {CgProfile} from "react-icons/cg";
import {IoPeopleSharp, IoKeyOutline} from "react-icons/io5";
import {BsTextParagraph} from "react-icons/bs";
import {GoGraph} from "react-icons/go";
import {VscGraph} from "react-icons/vsc";

const menuItems = [
    {
        key: "employee-details",
        title: "Employee Details",
        icon: <MdManageSearch className="h-10 w-10 text-blue-600"/>,
        bgClass: "bg-blue-50 hover:bg-blue-100",
        allowedRoles: ["ADMIN", "MANAGER", "EMPLOYEE", "SUPER ADMIN", "ATTENDANCE TEAM", "USER"],
        submenu: [
            {
                title: "View Profile",
                path: `/employees/profile`,
                icon: <CgProfile className="h-6 w-6 text-blue-600"/>,
                bgClass: "bg-blue-100 hover:bg-blue-200",
                allowedRoles: ["ADMIN", "MANAGER", "EMPLOYEE", "SUPER ADMIN", "ATTENDANCE TEAM", "USER"],
            },
            {
                title: "All Employees",
                path: "/employees/all",
                icon: <IoPeopleSharp className="h-6 w-6 text-blue-600"/>,
                bgClass: "bg-blue-100 hover:bg-blue-200",
                allowedRoles: ["ADMIN", "MANAGER", "SUPER ADMIN", "ATTENDANCE TEAM"],
            },
            {
                title: "Add New Member",
                path: "/add-employee",
                icon: <FaUserPlus className="h-6 w-6 text-yellow-600"/>,
                bgClass: "bg-yellow-50 hover:bg-yellow-100",
                allowedRoles: ["ADMIN", "MANAGER", "SUPER ADMIN"],
            },
            // {
            //     title: "Reset Password",
            //     path: "/employees/reset-password",
            //     icon: <IoKeyOutline className="h-6 w-6 text-blue-600"/>,
            //     bgClass: "bg-blue-100 hover:bg-blue-200",
            //     allowedRoles: ["ADMIN", "MANAGER", "SUPER ADMIN", "ATTENDANCE TEAM", "EMPLOYEE", "USER"],
            // },
        ],
    },

    {
        key: "work-day-entries",
        title: "Work Day Entries",
        icon: <MdWork className="h-10 w-10 text-indigo-600"/>,
        bgClass: "bg-indigo-50 hover:bg-indigo-100",
        allowedRoles: ["ADMIN", "MANAGER", "EMPLOYEE", "SUPER ADMIN", "ATTENDANCE TEAM", "USER"],
        submenu: [
            {
                title: "Work Entries",
                path: `/work-entry`,
                icon: <MdFormatListBulletedAdd className="h-6 w-6 text-indigo-600"/>,
                bgClass: "bg-indigo-100 hover:bg-indigo-200",
                allowedRoles: ["ADMIN", "MANAGER", "EMPLOYEE", "SUPER ADMIN", "ATTENDANCE TEAM", "USER"],
            },
        ],
    },

    {
        key: "attendance",
        title: "Attendance",
        icon: <MdOutlineSpellcheck className="h-10 w-10 text-green-600"/>,
        bgClass: "bg-green-50 hover:bg-green-100",
        allowedRoles: ["ADMIN", "ATTENDANCE TEAM", "MANAGER", "SUPER ADMIN", "EMPLOYEE", "USER"],
        submenu: [
            {
                title: "View All Entries",
                path: "/attendance",
                icon: <MdPresentToAll className="h-6 w-6 text-green-600"/>,
                bgClass: "bg-green-100 hover:bg-green-200",
                allowedRoles: ["ADMIN", "ATTENDANCE TEAM", "MANAGER", "SUPER ADMIN", "EMPLOYEE", "USER"],
            },
            {
                title: "Add Mass Attendance",
                path: "/attendance/mass-entry",
                icon: <MdFormatListBulletedAdd className="h-6 w-6 text-green-600"/>,
                bgClass: "bg-green-100 hover:bg-green-200",
                allowedRoles: ["ADMIN", "ATTENDANCE TEAM", "MANAGER", "SUPER ADMIN", "USER"],
            },
        ],
    },

    {
        key: "project-status",
        title: "Project Section",
        icon: <VscGraph className="h-10 w-10 text-red-600"/>,
        bgClass: "bg-red-50 hover:bg-red-100",
        allowedRoles: ["SUPER ADMIN", "ADMIN", "EMPLOYEE", "ATTENDANCE TEAM", "MANAGER", "USER"],
        submenu: [
            {
                title: "View Active Projects",
                path: "/projects/active",
                icon: <BsTextParagraph className="h-6 w-6 text-red-600"/>,
                bgClass: "bg-red-100 hover:bg-red-200",
                allowedRoles: ["SUPER ADMIN", "ADMIN", "EMPLOYEE", "ATTENDANCE TEAM", "MANAGER", "USER"],
            },
            {
                title: "Archive Projects",
                path: "/projects/achived",
                icon: <GoGraph className="h-6 w-6 text-red-600"/>,
                bgClass: "bg-red-100 hover:bg-red-200",
                allowedRoles: ["SUPER ADMIN", "ADMIN", "EMPLOYEE", "ATTENDANCE TEAM", "MANAGER", "USER"],
            },
            {
                title: "Billing Status",
                path: "/dev",
                icon: <MdIncompleteCircle className="h-6 w-6 text-red-600"/>,
                bgClass: "bg-red-100 hover:bg-red-200",
                allowedRoles: ["SUPER ADMIN", "USER"],
            },
        ],
    },
];

export default menuItems;
