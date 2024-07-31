import { HmacSHA256, enc } from "crypto-js";
import { ADDRESS_KIND, OWNER_RELATIVE } from "common/constants";
import dayjs from "dayjs";
import { Buffer } from "buffer";
import {
  AddressInfo,
  ImageResponse,
  Profile,
  ProfileForm,
  ProfileResponse,
} from "modules/ApplicationSubmit/type";
import { OCRResponse } from "./upload";

const ONE_HOUR = 3_600;

const {
  REACT_APP_SIGNED_KEY,
  REACT_APP_SIGNED_KEY_ROUTE_ID,
  REACT_APP_SIGNED_KEY_SECRET_KEY,
  REACT_APP_SIGNED_KEY_TTL,
  REACT_APP_STORAGE_URL,
  REACT_APP_CDN_URL,
} = process.env;

export function isInViewport(element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <=
      (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

export function getCoordination(error: string): Promise<[number, number]> {
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve([position.coords.longitude, position.coords.latitude]);
        },
        (err) => {
          reject(err.message);
        },
        {
          enableHighAccuracy: true,
        }
      );
    } else reject(error);
  });
}

export function convertSecondToTimer(second: number): string {
  let start = 14;
  if (second >= ONE_HOUR) start = 11;
  return new Date(second * 1000).toISOString().slice(start, 19);
}

export function isTouchDevice() {
  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
}

export function checkIsMobile() {
  const toMatch = [
    /Android/i,
    /webOS/i,
    /iPhone/i,
    /iPad/i,
    /iPod/i,
    /BlackBerry/i,
    /Windows Phone/i,
  ];

  return toMatch.some((toMatchItem) => {
    return navigator.userAgent.match(toMatchItem);
  });
}

export function b64toBlob(b64Data: string) {
  if (!b64Data) return null;
  const contentType = "image/jpeg";
  const sliceSize = 512;

  const b64DataString = b64Data?.slice(b64Data.indexOf(",") + 1);
  const byteCharacters = atob(b64DataString);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);

    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i += 1) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);

    byteArrays.push(byteArray);
  }

  const blob = new Blob(byteArrays, {
    type: contentType,
  });
  return blob;
}

export function getInfoFormAddress(address: string, provinces: any[] = []) {
  const result = {
    street: null,
    ward: null,
    district: null,
    city: null,
  } as any;
  if (!address) return result;

  const split = address.split(",");
  if (provinces.length <= 0 || split.length <= 0) return result;

  const provinceFromOCR = split?.pop()?.toLowerCase().replace(/\s+/g, "");
  const findProvinceFromList = provinces.find(
    (item) =>
      item?.name?.toLowerCase()?.replace(/\s+/g, "")?.includes(provinceFromOCR)
  );
  if (!findProvinceFromList?.name) {
    result.street = split
      .slice(0, split.length - 2)
      .join(",")
      .trim();
    return result;
  }

  result.city = findProvinceFromList.name;
  result.district = split?.[split.length - 1]?.trim();
  result.ward = split?.[split.length - 2]?.trim();
  result.street = split
    .slice(0, split.length - 2)
    .join(",")
    .trim();

  return result;
}

export function formatDay(str: string): string {
  return dayjs(str).format("DD/MM/YYYY");
}

export const convertProfileFormToProfile = (
  profiles: ProfileForm[],
  coor: string | null,
  isSubmit: boolean,
  pcCode?: string
): Profile[] => {
  const profile: Profile[] = [];

  profiles
    .filter((item) => item.is_saved)
    .forEach((item) => {
      const resident = {
        ...item.address_info?.resident,
        kind: ADDRESS_KIND.PERMARNENT_RESIDENT,
        is_living: item.address_info?.resident?.is_living ?? false,
        is_owner: item.address_info?.resident?.is_owner ?? false,
        residence_document_imgs: convertArrayDataToStringId(
          item.address_info?.resident?.residence_document_imgs
        ),
      };

      const termporary = (() => {
        if (resident.is_living) {
          return {
            ...resident,
            kind: ADDRESS_KIND.TEMPORARY_RESIDENT,
            residence_document_imgs: null,
          };
        } else {
          return {
            ...item.address_info?.resident,
            ...item.address_info?.termporary,
            kind: ADDRESS_KIND.TEMPORARY_RESIDENT,
            is_owner:
              item.address_info?.termporary?.is_owner ??
              item.address_info?.resident?.is_owner ??
              false,
            is_living: true,
            residence_document_imgs: null,
          };
        }
      })();

      const id_card_back_document_imgs =
        convertArrayDataToStringId(item.id_card_back_document_imgs) ||
        (item.id_card_back as ImageResponse)?.id?.toString() ||
        "";
      const id_card_front_document_imgs =
        convertArrayDataToStringId(item.id_card_front_document_imgs) ||
        (item.id_card_front as ImageResponse)?.id?.toString() ||
        "";
      const portrait_document_imgs =
        convertArrayDataToStringId(item.ekyc_info?.portrait_document_imgs) ||
        (item.ekyc_info?.portrait as ImageResponse)?.id?.toString() ||
        "";

      const p: Profile = {
        ...item,
        job: item.job,
        job_title: item.job_title,
        dob: item.dob?.split(" ")[0],
        papers: item.papers?.filter((item) => !!item)?.join(","),
        patient_relationship: item.patient_relationship ?? OWNER_RELATIVE,
        income: item.income ?? 0,
        private_school: +item.private_school ?? null,
        electric_bill: item.electric_bill || 0,
        private_insurance: +item.private_insurance ?? null,
        coordination: coor,
        address_info: [resident, termporary],
        electric_bill_document_imgs: convertArrayDataToStringId(
          item.electric_bill_document_imgs
        ),
        income_document_imgs: convertArrayDataToStringId(
          item.income_document_imgs
        ),
        prescription: item.prescription?.join(","),
        medical_indication_document_imgs: convertArrayDataToStringId(
          item.medical_indication_document_imgs
        ),
        other_document_imgs: convertArrayDataToStringId(
          item.other_document_imgs
        ),
        id_card_back_document_imgs: id_card_back_document_imgs,
        id_card_front_document_imgs: id_card_front_document_imgs,
        portrait_document_imgs: portrait_document_imgs,
      };

      // if (!isSubmit && p.id) {
      //   delete p.id;
      // }

      if (isSubmit && !p.pc_code) {
        p.pc_code = pcCode;
      }

      profile.push(p);
    });

  return profile;
};

export const normalizeCityName = (city: string) => {
  if (!city) return "";
  return city
    .replace(/^(tỉnh )|(thành phố )|(tp )|(tp\.)|(t\.)/gi, "") // remove preword
    .trim()
    .replace(/(^\w{1})|(\s+\w{1})/g, (letter) => letter.toUpperCase()); // capitalize the first letter of each word.
};

export const normalizeDistrictName = (district: string) => {
  if (!district) return "";
  return district
    .replace(/^(huyện )|(quận )|(tp )|(thành phố )|(tp\.)/gi, "") // remove preword
    .trim()
    .replace(/(^\w{1})|(\s+\w{1})/g, (letter) => letter.toUpperCase()); // capitalize the first letter of each word.
};

export const normalizeWardName = (ward: string) => {
  if (!ward) return "";
  return ward
    .replace(/^(xã )|(phường )|(thị trấn )|(x\.)|(p\.)|(tt\.)/gi, "") // remove preword
    .trim()
    .replace(/(^\w{1})|(\s+\w{1})/g, (letter) => letter.toUpperCase()); // capitalize the first letter of each word.
};

export function encodeText(text: string) {
  return Buffer.from(text).toString("base64");
}

export function decodeText(text: string) {
  return Buffer.from(text, "base64").toString();
}

export function generateId() {
  return Math.random().toString(16).slice(2);
}

export function checkPermissionCamera(type: "environment" | "user") {
  return new Promise((resolve) => {
    window.navigator.getUserMedia(
      {
        video: {
          facingMode: {
            ideal: type,
          },
        } as any,
      },
      (stream) => {
        stream.getTracks().forEach((track: any) => track?.stop());
        resolve(true);
      },
      () => {
        resolve(false);
      }
    );
  }) as Promise<boolean>;
}

export function getStringFromAddress({
  city = "",
  district = "",
  ward = "",
  street = "",
}: {
  city?: string;
  district?: string;
  ward?: string;
  street?: string;
}) {
  const list = [street, ward, district, city].filter((item) => !!item);
  return list.join(", ").trim();
}

export function getAddressFromString(value: string) {
  const addresses = value.split(",");

  const city = addresses.pop()?.trim();

  const district = addresses.pop()?.trim();

  const ward = addresses.pop()?.trim();

  const street = addresses.map((item) => item.trim()).join(", ");

  return {
    city,
    district,
    ward,
    street,
  };
}

export function checkValidDateFormat(date: string) {
  if (!date) return false;
  return date.match(/^\d\d\/\d\d\/\d\d\d\d$/);
}

export function signedKeyUrl(url?: string): string {
  if (!url) return "";
  if (REACT_APP_SIGNED_KEY !== "enable" || !REACT_APP_SIGNED_KEY_SECRET_KEY) {
    return url;
  }
  const stime = Math.floor(Date.now() / 1_000);
  const uri = url.replace(REACT_APP_STORAGE_URL || "", "");
  if (uri.includes("http")) return uri;

  const str_to_hash = `${stime}-${REACT_APP_SIGNED_KEY_TTL}-${REACT_APP_SIGNED_KEY_ROUTE_ID}-${uri}`;

  const hashed_value = HmacSHA256(str_to_hash, REACT_APP_SIGNED_KEY_SECRET_KEY)
    .toString(enc.Hex)
    .toLowerCase();

  const queryString = new URLSearchParams({
    stime: stime.toString(),
    ttl: REACT_APP_SIGNED_KEY_TTL as string,
    mtoken: hashed_value,
  }).toString();

  return `${REACT_APP_CDN_URL}${uri}?${queryString}`;
}

export function getProfilesDataFromResponse(data: ProfileResponse[]) {
  data
    .sort(
      (a, b) =>
        (b.pap_relationship === OWNER_RELATIVE ? 1 : 0) -
        (a.pap_relationship === OWNER_RELATIVE ? 1 : 0)
    )
    .sort((a, b) => (b.is_present ? 1 : 0) - (a.is_present ? 1 : 0));

  const coordination = (data
    .find((profile) => profile.is_present)
    ?.coordination?.split(",")
    ?.map((data) => parseFloat(data)) as [number, number]) || [0, 0];

  const profiles: ProfileForm[] = data.map((profile, index) => {
    const resident = profile.addresses?.find(
      (addr) => addr.kind === ADDRESS_KIND.PERMARNENT_RESIDENT
    ) as AddressInfo;

    const termporary = profile.addresses?.find(
      (addr) => addr.kind === ADDRESS_KIND.TEMPORARY_RESIDENT
    ) as AddressInfo;

    const pf: ProfileForm = {
      ...profile,
      index: index + 1,
      dob: profile.dob,
      address_info: {
        resident: {
          ...resident,
          residence_document_imgs: resident?.residence_document_imgs,
        },
        termporary: {
          ...termporary,
          residence_document_imgs: termporary?.residence_document_imgs,
        },
      },
      is_saved: true,
      is_new: false,
      patient_relationship: profile.pap_relationship,
      id_card_front: profile.liveness?.id_card_front,
      id_card_back: profile.liveness?.id_card_back,
      ekyc_info: profile.liveness,
      income: profile.working_state?.income,
      job_company_name: profile.working_state?.job_company_name,
      job_company_address: profile.working_state?.job_company_address,
      job: profile.working_state?.job,
      job_description: profile.working_state?.job_description,
      job_title: profile.working_state?.job_title,
      private_school: profile.living_bill?.private_school,
      school_name: profile.living_bill?.school_name,
      school_level: profile.living_bill?.school_level,
      electric_bill: profile.living_bill?.electric_bill,
      phone_brand: profile.living_bill?.phone_brand,
      hospital_name: profile.living_bill?.hospital_name,
      private_insurance: profile.living_bill?.has_insurance,
      insurance_description: profile.living_bill?.insurance_description,
      loan: profile.living_bill?.loan,
      papers: profile.papers?.split(",")?.filter((item) => !!item),
      hospital: profile.patient_medical?.hospital,
      prescription: profile.patient_medical?.prescription?.split(","),
      car_owner: profile.living_bill?.car_owner,
      income_document_imgs: profile.working_state?.income_document_imgs,
      electric_bill_document_imgs:
        profile.living_bill?.electric_bill_document_imgs,
      electric_users: profile.living_bill?.electric_users,
      pc_code: "",
      medical_indication_document_imgs:
        profile.patient_medical?.medical_indication_document_imgs,
      id_card_front_document_imgs:
        profile.liveness?.id_card_front_document_imgs,
      id_card_back_document_imgs: profile.liveness?.id_card_back_document_imgs,
    };

    return pf;
  });

  return {
    profiles,
    coordination,
  };
}

export function getDataFromOcr(dataResponse: OCRResponse, provinces: any) {
  const profile = {
    address_info: {
      resident: null,
    },
  } as any;

  const data = dataResponse.data;

  if (!data) return profile;

  if (data && Object.keys(data).length > 0) {
    profile.ekyc_info = {
      id_card_kind: data.documentType,
      extra_full_name: data.name,
      extra_dob: data.dob,
      extra_idcard_number: data.id,
      extra_gender: data.gender,
      extra_pr_address: data.address,
    };

    if (data.address) {
      const parseAddress = getInfoFormAddress(data.address, provinces);
      if (parseAddress) {
        profile.address_info.resident = parseAddress;
      }
    }

    if (data.name) profile.full_name = data.name;
    if (data.id) profile.id_card_number = data.id;
    if (data.dob && checkValidDateFormat(data.dob))
      profile.dob = dayjs(data.dob, "DD/MM/YYYY").format("YYYY-MM-DD");
    if (data.gender) profile.gender = data.gender;
  }
  if (!profile.address_info.resident) delete profile.address_info;

  return profile;
}

export function getLastElement(arr?: any[]) {
  if (!arr || !Array.isArray(arr)) return null;
  if (arr.at) return arr.at(-1);
  return arr[arr?.length - 1];
}

export const convertArrayDataToStringId = (data: any) => {
  if (Array.isArray(data) && data?.length === 0) return null;
  const finalData: any = [];
  if (data?.length === 1) {
    return data[0].id + "";
  } else {
    data?.forEach((item: any) => {
      finalData.push(item.id);
    });
    return finalData.join(",");
  }
};
export const convertObjectToArrayObject = (data: any) => {
  const finalData: any = [];
  finalData.push(data);
  return finalData;
};
export const convertNumberToString = (number: number) => {
  return number.toString();
};

export const preventWhiteSpace = (event: any) => {
  if (event?.key === " ") {
    // Check if the pressed key is space
    event.preventDefault(); // Prevent the default behavior (typing space)
  }
};

export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;

  return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
    const context = this;

    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
}

export const convertSingpassDataToFormData = (data: any, oldData: any) => {
  console.log("oldData: ", oldData);
  console.log("data: ", data);
  const rawData = { ...data };
  const newData: any = {};
  newData.full_name = str(rawData.aliasname);
  newData.phone = "0" + str(data.mobileno?.nbr);
  newData.email = str(data.email);
  newData.id_card_number = str(data.passportnumber);
  newData.dob = dayjs(str(data.dob));
  newData.gender = str(data.sex);
  if (data["noa-basic"]) {
    newData.income = str(data["noa-basic"].amount)
      ? formatMoney(str(data["noa-basic"].amount), 0, ".", ",")
      : "";
  }
  newData.job = str(data.occupation);
  newData.house_type =
    str(data.housingtype) == "" ? str(data.hdbtype) : str(data.housingtype);

  newData.address =
    data.regadd.type == "SG"
      ? str(data.regadd.country) == ""
        ? ""
        : str(data.regadd.block) +
          " " +
          str(data.regadd.building) +
          " \n" +
          "#" +
          str(data.regadd.floor) +
          "-" +
          str(data.regadd.unit) +
          " " +
          str(data.regadd.street) +
          " \n" +
          "Singapore " +
          str(data.regadd.postal)
      : data.regadd.type == "Unformatted"
        ? str(data.regadd.line1) + "\n" + str(data.regadd.line2)
        : "";

  return { ...newData };
};

//  singpass form format

export function formatMoney(n: any, c: any, d: any, t: any) {
  var c = isNaN((c = Math.abs(c))) ? 2 : c,
    d = d == undefined ? "." : d,
    t = t == undefined ? "," : t,
    s = n < 0 ? "-" : "",
    i: any = String(parseInt((n = Math.abs(Number(n) || 0).toFixed(c)))),
    j: any = (j = i.length) > 3 ? j % 3 : 0;

  return (
    s +
    (j ? i.substr(0, j) + t : "") +
    i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) +
    (c
      ? d +
        Math.abs(n - i)
          .toFixed(c)
          .slice(2)
      : "")
  );
}

// used to output data items with value or desc
export function str(data: any) {
  if (!data) return null;
  if (data.value) return data.value;
  else if (data.desc) return data.desc;
  else if (typeof data == "string") return data;
  else return "";
}
