import {
  ArrowLeftOutlined,
  CloseOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import { Drawer } from "antd";
import { useAppDispatch, useAppSelector } from "appRedux";
import { MENUS, MenuType } from "common/constants";
import PATH from "common/path";
import { clearProfile } from "modules/ApplicationSubmit/slice";
import { asyncLogOut, logout } from "modules/Auth/slice";
import { ReactNode, useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { shallowEqual } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { EVENT_NAME, logGAEvent } from "utils/googleAnalytics";
import {
  IS_SUBMIT_APPLICATION,
  NON_SUBMIT_PROFILE_DATA,
  localStorageService,
} from "utils/localStorage";
// import { setLang } from 'utils/localStorage';

type LayoutProps = {
  children: ReactNode;
  back?: () => void;
  menu?: boolean;
  showLogo?: boolean;
  linkLogo?: string;
};

export default function Layout({
  children,
  back,
  menu = true,
  showLogo = true,
  linkLogo = "#",
}: LayoutProps) {
  // const { i18n } = useTranslation();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const [authToken, authPhone] = useAppSelector(
    (state) => [state.auth.token, state.auth.phone],
    shallowEqual
  );
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  const isSubmitApplication = localStorageService.get(IS_SUBMIT_APPLICATION);
  const nonSubmitData = localStorageService.get(NON_SUBMIT_PROFILE_DATA);

  const { pathname } = useLocation();

  const MENU_EXTEND = useMemo(() => {
    if (!authToken && !authPhone) return MENUS;
    const subMenu = {
      label: t(authToken ? "LOGOUT" : "EXIT"),

      path: PATH.EXIT,
      event: authToken ? EVENT_NAME.BTN_LOGOUT : EVENT_NAME.BTN_EXIT,
    } as MenuType;
    return MENUS.concat(subMenu);
  }, [authToken, authPhone, t]);

  const onLogOut = useCallback(() => {
    dispatch(logout());
    dispatch(clearProfile());
    dispatch(asyncLogOut());
    !isSubmitApplication &&
      localStorageService.set(NON_SUBMIT_PROFILE_DATA, nonSubmitData);
    navigate(PATH.HOME);
  }, [dispatch, navigate, isSubmitApplication, nonSubmitData]);

  const handleExit = useCallback(() => {
    if (authToken) return onLogOut();
    const confirmExit = window.confirm(t("CONFIRM_EXIT_REGISTER_FLOW"));

    if (confirmExit) return onLogOut();
  }, [authToken, t, onLogOut]);

  // const changeLang = (lang: 'vi-VN' | 'en-US') => {
  //   i18n.changeLanguage(lang);
  //   setLang(lang);
  // };

  return (
    <>
      <HeaderSmall>
        <div>
          <ArrowLeftOutlined
            onClick={back}
            style={{ visibility: back ? "visible" : "hidden" }}
          />
        </div>
        <LogoLink to={linkLogo} canClick={linkLogo !== "#"}>
          <LogoImage src="/Logo.webp" show={showLogo ? 1 : 0} />
        </LogoLink>

        <MenuOutlined
          onClick={() => setShowMenu(true)}
          style={{ visibility: menu ? "visible" : "hidden" }}
        />
      </HeaderSmall>
      <HeaderLarge>
        <LogoLink to={linkLogo} canClick={linkLogo !== "#"}>
          <LogoImage src="/Logo.webp" show={1} />
        </LogoLink>

        <ListMenuLarge visible={menu ? 1 : 0}>
          {MENU_EXTEND.map((item) => (
            <MenuItem
              key={item.path}
              onClick={() => {
                if (item.event) {
                  logGAEvent(item.event, { phone: authPhone });
                }
              }}
            >
              {item.path === PATH.EXIT ? (
                <ExitButton onClick={handleExit}>{t(item.label)}</ExitButton>
              ) : (
                <NavLinkCustom
                  current={pathname === item.path ? 1 : 0}
                  to={item.path}
                >
                  {t(item.label)}
                </NavLinkCustom>
              )}
            </MenuItem>
          ))}
          {/* <SwitchLangLi>
            <SwitchButton
              active={i18n.language === 'vi-VN'}
              onClick={() => changeLang('vi-VN')}
            >
              VI
            </SwitchButton>{' '}
            |{' '}
            <SwitchButton
              active={i18n.language === 'en-US'}
              onClick={() => changeLang('en-US')}
            >
              EN
            </SwitchButton>
          </SwitchLangLi> */}
        </ListMenuLarge>
      </HeaderLarge>
      <Drawer
        styles={{
          header: {
            display: "none",
          },
          body: {
            backgroundColor: "#4242EB",
          },
        }}
        onClose={() => setShowMenu(false)}
        open={showMenu}
        placement="top"
        height="auto"
      >
        <MenuSmall
          phone={authPhone}
          onClose={() => setShowMenu(false)}
          menuList={MENU_EXTEND}
          handleExit={handleExit}
        />
      </Drawer>
      {children}
    </>
  );
}

type MenuSmallProps = {
  phone: string;
  onClose: () => void;
  menuList: any[];
  handleExit: () => void;
};

function MenuSmall({ phone, onClose, menuList, handleExit }: MenuSmallProps) {
  const { t } = useTranslation();
  // const changeLang = (lang: 'vi-VN' | 'en-US') => {
  //   i18n.changeLanguage(lang);
  //   setLang(lang);
  // };

  return (
    <MenuContainer>
      <CloseOutlined onClick={onClose} />
      <ListMenu>
        {menuList.map((menu) => (
          <ItemMenu
            key={menu.path}
            onClick={() => {
              if (menu.event) {
                logGAEvent(menu.event, { phone });
              }
            }}
          >
            {menu.path === PATH.EXIT ? (
              <ExitButton onClick={handleExit}>{t(menu.label)}</ExitButton>
            ) : (
              <NavLink to={menu.path}>{t(menu.label)}</NavLink>
            )}
          </ItemMenu>
        ))}
      </ListMenu>
      {/* <SwitchLang>
        <SwitchButton
          active={i18n.language === 'vi-VN'}
          onClick={() => changeLang('vi-VN')}
        >
          VI
        </SwitchButton>{' '}
        |{' '}
        <SwitchButton
          active={i18n.language === 'en-US'}
          onClick={() => changeLang('en-US')}
        >
          EN
        </SwitchButton>
      </SwitchLang> */}
    </MenuContainer>
  );
}

const HeaderSmall = styled.div`
  z-index: 9;
  display: flex;
  justify-content: space-between;
  position: sticky;
  top: 0;
  padding: 1rem;
  background-color: white;
  box-shadow: ${(props) => props.theme.boxShadow};
  box-shadow: ${(props) => props.theme.boxShadow};

  @media screen and (min-width: 1110px) {
    display: none;
  }
`;

const HeaderLarge = styled.div`
  display: flex;
  justify-content: space-between;
  z-index: 9;
  align-items: center;
  padding: 1.25rem;
  background-color: white;
  box-shadow: ${(props) => props.theme.boxShadow};
  box-shadow: ${(props) => props.theme.boxShadow};
  position: sticky;
  top: 0;
  padding-inline: 8rem;

  @media screen and (max-width: 1390px) {
    padding-inline: 3rem;
  }

  @media screen and (max-width: 1028px) {
    padding-inline: 2rem;
  }

  @media screen and (max-width: 1110px) {
    display: none;
  }
`;

interface LogoImageProps {
  show: number;
}

const LogoImage = styled.img<LogoImageProps>`
  width: 11rem;
  height: auto;
  visibility: ${(props) => (props.show ? "visible" : "hidden")};
  visibility: ${(props) => (props.show ? "visible" : "hidden")};
`;

const MenuContainer = styled.div`
  text-align: right;
  color: white;
  font-size: 16px;
`;

const ListMenu = styled.ul`
  list-style-type: none;
`;

const ItemMenu = styled.li`
  padding-block: 1rem;
  font-weight: 600;
`;

const NavLink = styled(Link)`
  color: inherit;
  text-decoration: none;

  &:hover {
    color: ${(props) => props.theme.colorPrimary};
    color: ${(props) => props.theme.colorPrimary};
  }

  @media screen and (max-width: 1110px) {
    color: white !important;
  }
`;

interface ListMenuLargeProps {
  visible: number;
}

const ListMenuLarge = styled.ul<ListMenuLargeProps>`
  display: flex;
  gap: 2.5rem;
  list-style-type: none;
  margin-block: 0;
  align-items: center;
  color: ${(props) => props.theme.grey7};
  visibility: ${(props) => (props.visible ? "visible" : "hidden")};
  color: ${(props) => props.theme.grey7};
  visibility: ${(props) => (props.visible ? "visible" : "hidden")};
`;

const MenuItem = styled.li`
  font-weight: 600;
  color: inherit;

  @media screen and (max-width: 1225px) {
    font-size: 0.75rem;
  }
`;

interface INavLinkCustom {
  current: number;
}

const NavLinkCustom = styled(NavLink)<INavLinkCustom>`
  color: ${(props) =>
    props.current ? props.theme.colorPrimary : props.theme.grey7};
`;

// const SwitchLang = styled.div``;

// const SwitchLangLi = styled.li``;

// interface SwitchButtonProps {
//   active: boolean;
// }

// const SwitchButton = styled.span<SwitchButtonProps>`
//   color: ${props =>
//     props.active ? props.theme.colorPrimary : props.theme.grey7};
//   cursor: pointer;
//   font-weight: 600;
//   font-size: 0.875rem;

//   @media screen and (max-width: 1225px) {
//     font-size: 0.75rem;
//   }

//   @media screen and (max-width: 1110px) {
//     color: ${props => (props.active ? 'black' : 'white')};
//   }
// `;

type LogoLinkProps = {
  canClick: boolean;
};

const LogoLink = styled(Link)<LogoLinkProps>`
  cursor: ${(props) => (props.canClick ? "cursor" : "default")};
  cursor: ${(props) => (props.canClick ? "cursor" : "default")};
`;

const ExitButton = styled.span`
  cursor: pointer;
  color: inherit;
  text-decoration: none;

  &:hover {
    color: ${(props) => props.theme.colorPrimary};
    color: ${(props) => props.theme.colorPrimary};
  }

  @media screen and (max-width: 1110px) {
    color: white !important;
  }
`;
