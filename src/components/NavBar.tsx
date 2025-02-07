import { useState } from "react";
import styles from "./NavBar.module.css";
import logoImg from "../assets/cgLogo.png";
import { AspectRatio } from "radix-ui";

const NavBar: React.FC = () => {
    return (
        <div className={styles.NavbarContainer}>
            <div className={styles.Container}>
                <AspectRatio.Root ratio={22 / 6}>
                    <img className={styles.Image} src={logoImg} alt="logo" />
                </AspectRatio.Root>
            </div>
        </div>
    );
};

export default NavBar;
