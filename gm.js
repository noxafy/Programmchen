const ans = JSON.parse(process.argv[2]);

switch (ans.status) {
  case "OK":
    console.log("Entfernung: " + ans.routes[0].legs[0].distance.text + " (" + ans.routes[0].legs[0].duration.text + ")");
    break;
  case "INVALID_REQUEST":
    console.log(ans.error_message);
    break;
  case "ZERO_RESULTS":
    console.log("No route found for your request!");
    break;
  default:
    console.log("Unknown status code: " + ans.status);
    console.log(ans)    
}
