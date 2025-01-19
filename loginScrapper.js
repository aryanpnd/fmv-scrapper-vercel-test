import axios from "axios";
import { load } from "cheerio";
import { umsUrls } from "./umsUrls.js";
import { umsHeaders } from "./umsHeaders.js";
import { CookieJar } from "tough-cookie";
import { wrapper } from "axios-cookiejar-support";

export async function umsLogin(user){
  const url = umsUrls.LOGIN_URL;
  const headers= umsHeaders;

  // Initialize cookie jar
  const jar = new CookieJar();
  const client = wrapper(axios.create({ jar, headers: headers }));

  try {
    // Initial GET request to fetch view states
    let response = await client.get(url);
    let $ = load(response.data);

    let __VIEWSTATE = $("#__VIEWSTATE").val() 
    let __VIEWSTATEGENERATOR = $("#__VIEWSTATEGENERATOR").val() 
    let __EVENTVALIDATION = $("#__EVENTVALIDATION").val()

    const payloadWithRegNoOnly = new URLSearchParams({
      "__LASTFOCUS": "",
      "__EVENTTARGET": "txtU",
      "__EVENTARGUMENT": "",
      "__VIEWSTATE": __VIEWSTATE,
      "__VIEWSTATEGENERATOR": __VIEWSTATEGENERATOR,
      "__SCROLLPOSITIONX": "0",
      "__SCROLLPOSITIONY": "0",
      "__EVENTVALIDATION": __EVENTVALIDATION,
      "txtU": user.reg_no,
      "TxtpwdAutoId_8767": "",
      "DropDownList1": "1",
    });

    // POST request with registration number only
    response = await client.post(url, payloadWithRegNoOnly.toString(), {
      headers: { ...headers },
    });

    $ = load(response.data);

    __VIEWSTATE = $("#__VIEWSTATE").val() 
    __VIEWSTATEGENERATOR = $("#__VIEWSTATEGENERATOR").val() 
    __EVENTVALIDATION = $("#__EVENTVALIDATION").val() 

    const payloadWithPassword = new URLSearchParams({
      "__LASTFOCUS": "",
      "__EVENTTARGET": "",
      "__EVENTARGUMENT": "",
      "__VIEWSTATE": __VIEWSTATE,
      "__VIEWSTATEGENERATOR": __VIEWSTATEGENERATOR,
      "__SCROLLPOSITIONX": "0",
      "__SCROLLPOSITIONY": "0",
      "__EVENTVALIDATION": __EVENTVALIDATION,
      "txtU": user.reg_no,
      "TxtpwdAutoId_8767": user.password,
      "ddlStartWith": "StudentDashboard.aspx",
      "iBtnLogins150203125": "Login",
    });

    // Post request with registration number and password
    response = await client.post(url, payloadWithPassword.toString(), {
      headers: { ...headers },
    });

    const cookies = jar.getCookiesSync(url);
    const aspCookie = cookies.find(cookie => cookie.key === "ASP.NET_SessionId");

    if (!aspCookie) {
      return {
        login: false,
        message: "Failed to login",
        cookie: ""
      }
    }

    // find element with "fg-password" in response.data and also get the text of that element and remove all \n
    const fgPassword = load(response.data)('.fg-password').text().replace(/\n/g, '')
    
    if (fgPassword.length < 1) {
      return {
        login: false,
        message: "Invalid Credentials",
        cookie: ""
      }
    }

    return {
      login: true,
      message: "Login Successful",
      cookie: aspCookie.cookieString(),
      passwordExpiry: fgPassword
    };
  } catch (error) {
    console.error(error);
    return {
      login: false,
      message: error.message,
      cookie: ""
    }
  }
}