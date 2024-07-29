import { LogIn, SignUp, TermConfirm } from "modules/Auth";
import PATH from "./path";
import { Contact, NotFound, TermCondition } from "modules/Static";
import ApplicationSubmit from "modules/ApplicationSubmit/Suspense";
import SplashPage from "modules/Splash";
import Result from "modules/Result/Suspense";
import SingPassSuspense from "modules/Singpass/Suspense";

const ROUTES = [
  {
    key: "home",
    path: PATH.HOME,
    Component: SplashPage,
  },
  {
    key: "term-confirm",
    path: PATH.TERM_CONFIRM,
    Component: TermConfirm,
  },

  {
    key: "application-submit",
    path: `${PATH.APPLICATION_SUBMIT}/*`,
    Component: ApplicationSubmit,
  },
  {
    key: "contact",
    path: PATH.CONTACT,
    Component: Contact,
  },
  {
    key: "login",
    path: PATH.LOGIN,
    Component: LogIn,
  },
  {
    key: "signup",
    path: PATH.SIGNUP,
    Component: SignUp,
  },
  // {
  //   key: 'intro',
  //   path: PATH.INTRO,
  //   Component: Intro,
  // },
  {
    key: "term-condition",
    path: PATH.TERM_CONDITION,
    Component: TermCondition,
  },
  {
    key: "result",
    path: `${PATH.RESULT}/*`,
    Component: Result,
  },
  {
    key: "restrive-info",
    path: `${PATH.RESTRIVE_INFO}/*`,
    Component: SingPassSuspense,
  },
  // {
  //   key: 'faq',
  //   path: PATH.FAQ,
  //   Component: Faq,
  // },
  {
    key: "404",
    path: "*",
    Component: NotFound,
  },
];

export default ROUTES;
