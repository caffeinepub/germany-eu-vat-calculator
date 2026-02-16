import List "mo:core/List";
import Blob "mo:core/Blob";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Map "mo:core/Map";
import Float "mo:core/Float";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Int "mo:core/Int";
import Stripe "stripe/stripe";
import OutCall "http-outcalls/outcall";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";



actor {
  // Stripe integration (public interface)
  var configuration : ?Stripe.StripeConfiguration = null;

  // User system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = {
    name : Text;
  };

  public type PdfFile = {
    filename : Text;
    content : Blob;
  };

  public type ZipFile = {
    filename : Text;
    content : Blob;
  };

  public type CsvFile = {
    filename : Text;
    content : Text;
  };

  public type ExcelFile = {
    filename : Text;
    content : Blob;
  };

  public type PlanType = {
    #unsubscribed;
    #free;
    #starter;
    #pro;
  };

  public type InvoiceRecord = {
    id : Text;
    invoiceNumber : Text;
    invoiceDate : Text;
    htmlSource : Text;
    vatAmount : Float;
    vatRate : Float;
    currency : Text;
    vatLabel : Text;
    createdAt : Time.Time;
    owner : ?Principal;
  };

  public type PlanUsage = {
    plan : PlanType;
    monthlyInvoices : Nat;
  };

  public type MappedPlanUsage = {
    plan : PlanType;
    invoicesThisMonth : Nat;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();
  let userPlans = Map.empty<Principal, PlanType>();
  let invoices = Map.empty<Text, InvoiceRecord>();
  let userInvoiceIds = Map.empty<Principal, List.List<Text>>();

  public type EventRecord = {
    id : Text;
    event_name : Text;
    country : Text;
    page : Text;
    device : Text;
    timestamp : Time.Time;
    metadata : Text;
  };

  public type UsageLimit = {
    fingerprint : Text;
    invoices_count : Nat;
    last_reset : Time.Time;
  };

  let _usageLimits = Map.empty<Text, UsageLimit>();
  var _events = Map.empty<Text, EventRecord>();

  public shared ({ caller }) func logEvent(event : EventRecord) : async () {
    _events.add(event.id, event);
  };

  public shared ({ caller }) func incrementUsage(fingerprint : Text) : async Nat {
    let now = Time.now();
    switch (_usageLimits.get(fingerprint)) {
      case (null) {
        let newLimit = {
          fingerprint;
          invoices_count = 1;
          last_reset = now;
        };
        _usageLimits.add(fingerprint, newLimit);
        1;
      };
      case (?limit) {
        if (now - limit.last_reset >= 2_592_000_000_000_000) {
          let newLimit = {
            fingerprint;
            invoices_count = 1;
            last_reset = now;
          };
          _usageLimits.add(fingerprint, newLimit);
          1;
        } else {
          let newLimit = {
            fingerprint;
            invoices_count = limit.invoices_count + 1;
            last_reset = limit.last_reset;
          };
          _usageLimits.add(fingerprint, newLimit);
          newLimit.invoices_count;
        };
      };
    };
  };

  public query ({ caller }) func getUsage(fingerprint : Text) : async Nat {
    switch (_usageLimits.get(fingerprint)) {
      case (null) { 0 };
      case (?limit) { limit.invoices_count };
    };
  };

  public query ({ caller }) func getEvents() : async [EventRecord] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view events");
    };
    _events.values().toArray();
  };

  public query ({ caller }) func getEventsByName(eventName : Text) : async [EventRecord] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view events");
    };
    _events.values().toArray().filter(func(evt) { evt.event_name == eventName });
  };

  func getUserPlan(user : Principal) : PlanType {
    switch (userPlans.get(user)) {
      case (null) { #free };
      case (?plan) { plan };
    };
  };

  func hasPlanLevel(user : Principal, requiredPlan : PlanType) : Bool {
    let userPlan = getUserPlan(user);
    switch (requiredPlan, userPlan) {
      case (#free, _) { true };
      case (#starter, #starter) { true };
      case (#starter, #pro) { true };
      case (#pro, #pro) { true };
      case (_, _) { false };
    };
  };

  func countMonthlyInvoices(user : Principal) : Nat {
    let now = Time.now();
    let currentMonth = Int.abs(now / 2_592_000_000_000_000) % 12 + 1;
    let currentYear = now / 31_536_000_000_000_000;

    switch (userInvoiceIds.get(user)) {
      case (null) { 0 };
      case (?ids) {
        var count = 0;
        for (id in ids.values()) {
          switch (invoices.get(id)) {
            case (null) {};
            case (?invoice) {
              let invoiceMonth = Int.abs(invoice.createdAt / 2_592_000_000_000_000) % 12 + 1;
              let invoiceYear = invoice.createdAt / 31_536_000_000_000_000;
              if (invoiceMonth == currentMonth and invoiceYear == currentYear) {
                count += 1;
              };
            };
          };
        };
        count;
      };
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only privileged users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only privileged users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func setUserPlan(user : Principal, plan : PlanType) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can set user plans");
    };
    userPlans.add(user, plan);
  };

  public shared ({ caller }) func saveInvoice(
    id : Text,
    invoiceNumber : Text,
    invoiceDate : Text,
    htmlSource : Text,
    vatAmount : Float,
    vatRate : Float,
    currency : Text,
    vatLabel : Text,
  ) : async () {
    var plan : PlanType = #free;
    var monthlyCount = 0;

    if (AccessControl.hasPermission(accessControlState, caller, #user)) {
      plan := getUserPlan(caller);
      monthlyCount := countMonthlyInvoices(caller);
      if (plan == #free and monthlyCount >= 5) {
        Runtime.trap("Free plan limit reached: Maximum 5 invoices per month");
      };
    };

    let invoice : InvoiceRecord = {
      id;
      invoiceNumber;
      invoiceDate;
      htmlSource;
      vatAmount;
      vatRate;
      currency;
      vatLabel;
      createdAt = Time.now();
      owner = ?caller;
    };

    invoices.add(id, invoice);

    if (AccessControl.hasPermission(accessControlState, caller, #user)) {
      switch (userInvoiceIds.get(caller)) {
        case (null) {
          let newList = List.fromArray([id]);
          userInvoiceIds.add(caller, newList);
        };
        case (?existingList) {
          let updatedList = List.fromArray([id]);
          existingList.addAll(updatedList.values());
          userInvoiceIds.add(caller, existingList);
        };
      };
    };
  };

  public query ({ caller }) func listInvoices() : async [InvoiceRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list invoices");
    };

    switch (userInvoiceIds.get(caller)) {
      case (null) { [] };
      case (?ids) {
        let mapped = ids.map<Text, ?InvoiceRecord>(
          func(id) {
            invoices.get(id);
          }
        );
        let filtered = mapped.filter(
          func(x) { x != null }
        );
        filtered.toArray().map(
          func(x) { switch (x) { case (?value) { value }; case (null) { invoices.values().toArray()[0] } } }
        );
      };
    };
  };

  public query ({ caller }) func getInvoice(id : Text) : async ?InvoiceRecord {
    let invoice = invoices.get(id);
    switch (invoice) {
      case (null) { null };
      case (?inv) {
        // Verify ownership or admin access
        switch (inv.owner) {
          case (null) {
            // Legacy invoice without owner - allow access
            invoice;
          };
          case (?owner) {
            if (caller == owner or AccessControl.isAdmin(accessControlState, caller)) {
              invoice;
            } else {
              Runtime.trap("Unauthorized: Can only view your own invoices");
            };
          };
        };
      };
    };
  };

  public query ({ caller }) func getCurrentPlan() : async PlanType {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their plan");
    };
    getUserPlan(caller);
  };

  public query ({ caller }) func getCurrentPlanUsage() : async PlanUsage {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their usage");
    };

    let plan = getUserPlan(caller);
    let monthlyInvoices = countMonthlyInvoices(caller);
    { plan; monthlyInvoices };
  };

  public query ({ caller }) func getMappedPlanUsage() : async MappedPlanUsage {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their usage");
    };

    let plan = getUserPlan(caller);
    let invoicesThisMonth = countMonthlyInvoices(caller);
    { plan; invoicesThisMonth };
  };

  public query ({ caller }) func canSaveInvoice() : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      return false;
    };

    let plan = getUserPlan(caller);
    let monthlyCount = countMonthlyInvoices(caller);

    switch (plan) {
      case (#free) { monthlyCount < 5 };
      case (#starter) { true };
      case (#pro) { true };
      case (#unsubscribed) { false };
    };
  };

  public shared ({ caller }) func downloadInvoiceAsPdf(id : Text) : async PdfFile {
    // Verify ownership or admin access
    let invoice = invoices.get(id);
    switch (invoice) {
      case (null) {
        Runtime.trap("Invoice not found");
      };
      case (?inv) {
        switch (inv.owner) {
          case (null) {
            // Legacy invoice without owner - allow access
          };
          case (?owner) {
            if (caller != owner and not AccessControl.isAdmin(accessControlState, caller)) {
              Runtime.trap("Unauthorized: Can only download your own invoices");
            };
          };
        };
      };
    };

    let pdfContent = "invoice-placeholder".encodeUtf8();
    {
      filename = "invoice-.pdf";
      content = pdfContent;
    };
  };

  public shared ({ caller }) func downloadInvoicesAsZip(ids : [Text]) : async ZipFile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can download batch invoices");
    };
    let zipContent = "ZIP archive placeholder".encodeUtf8();
    {
      filename = "invoices-batch.zip";
      content = zipContent;
    };
  };

  public shared ({ caller }) func downloadMonthInvoicesAsZip(year : Int, month : Nat) : async ZipFile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can download monthly invoices");
    };
    let zipContent = "ZIP archive for month placeholder".encodeUtf8();
    {
      filename = "invoices-" # year.toText() # "-" # month.toText() # ".zip";
      content = zipContent;
    };
  };

  public shared ({ caller }) func exportInvoicesAsCsv() : async CsvFile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can export invoices");
    };

    var csvContent = "Invoice Number,Invoice Date,Created At,Vat Rate,Vat Amount\n";
    {
      filename = "invoices.csv";
      content = csvContent;
    };
  };

  public shared ({ caller }) func exportInvoicesAsExcel() : async ExcelFile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can export invoices");
    };
    let excelContent = "Excel file placeholder".encodeUtf8();
    {
      filename = "invoices-datev.xlsx";
      content = excelContent;
    };
  };

  public type ServiceProductCategory = {
    #consultingDevelopment;
    #hardware;
    #contentMediaDesign;
    #hostingSupport;
    #others;
  };

  public type VatCalculation = {
    fromCountry : Text;
    toCountry : Text;
    vatIdNumber : ?Text;
    category : ServiceProductCategory;
    priceGrossCents : Nat;
  };

  public type CalculationResult = {
    ifReverseChargeRequired : Bool;
    exchangeRateAdjustment : Float;
    priceNetEuros : Float;
    priceGrossEuros : Float;
  };

  func reverseChargeRequired(fromCountry : Text, toCountry : Text, vatIdNumber : ?Text, category : ServiceProductCategory) : Bool {
    func isNaturalPerson(country : Text) : Bool {
      switch (vatIdNumber, category) {
        case (null, #consultingDevelopment) { true };
        case (null, #contentMediaDesign) { true };
        case (null, #hardware) { true };
        case (null, #hostingSupport) { true };
        case (null, #others) { true };
        case (_, _) { false };
      };
    };

    func consultingRule(country : Text) : Bool {
      func generify(countryCode : Text) : Bool {
        switch (countryCode, isAnyBusiness(countryCode), countryCode == "DE" or countryCode == "GER") {
          case (_, false, false) { true };
          case (_, _, true) { false };
          case (
            _,
            true,
            false,
          ) { not isNaturalPerson(countryCode) };
        };
      };

      generify(country);
    };

    func isAnyBusiness(country : Text) : Bool {
      switch (vatIdNumber) {
        case (null) { false };
        case (?vatId) { vatId.size() > 0 };
      };
    };

    func generify(countryCode : Text) : Bool {
      let consulting = #consultingDevelopment;
      switch (countryCode, isAnyBusiness(countryCode), fromCountry, toCountry, category, countryCode == "DE" or countryCode == "GER") {
        case (_, false, _, _, consulting, _) { consultingRule(fromCountry) };
        case (_, _, _, _, consulting, _) { consultingRule(fromCountry) };
        case (_, _, _, _, _, true) { false };
        case (_, _, _, _, _, _) { false };
      };
    };

    generify(fromCountry);
  };

  func getExchangeRateAdjustment(fromCountry : Text, toCountry : Text) : Float {
    switch (toCountry) {
      case ("CH") { 0.90 };
      case ("GB") { 0.80 };
      case ("US") { 1.10 };
      case (_) { 1.0 };
    };
  };

  public shared ({ caller }) func calculate(rate : VatCalculation) : async CalculationResult {
    let exchangeRateAdjustment = getExchangeRateAdjustment(rate.fromCountry, rate.toCountry);

    let shouldReverseCharge = reverseChargeRequired(rate.fromCountry, rate.toCountry, rate.vatIdNumber, rate.category);
    let priceInFloat = rate.priceGrossCents.toFloat();

    if (shouldReverseCharge) {
      return {
        ifReverseChargeRequired = true;
        exchangeRateAdjustment = exchangeRateAdjustment;
        priceNetEuros = priceInFloat / 10000.0 * exchangeRateAdjustment;
        priceGrossEuros = priceInFloat / 10000.0 * exchangeRateAdjustment;
      };
    };

    let adjustedValue = priceInFloat * exchangeRateAdjustment / 10000.0;
    let priceNetEuro = adjustedValue / 1.19;
    let priceGrossEuro = adjustedValue;

    {
      ifReverseChargeRequired = false;
      exchangeRateAdjustment;
      priceNetEuros = priceNetEuro;
      priceGrossEuros = priceGrossEuro;
    };
  };

  public query func getLastCalculation() : async ?VatCalculation {
    null;
  };

  public shared ({ caller }) func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    await Stripe.getSessionStatus(getStripeConfiguration(), sessionId, transform);
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    await Stripe.createCheckoutSession(getStripeConfiguration(), caller, items, successUrl, cancelUrl, transform);
  };

  public query func isStripeConfigured() : async Bool {
    configuration != null;
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can configure Stripe");
    };
    configuration := ?config;
  };

  func getStripeConfiguration() : Stripe.StripeConfiguration {
    switch (configuration) {
      case (null) { Runtime.trap("Stripe needs to be first configured") };
      case (?value) { value };
    };
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  public query ({ caller }) func canICallApi() : async Text {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can access this endpoint");
    };
    "yes";
  };

  public query ({ caller }) func permissionCheck() : async PlanType {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check their plan");
    };
    getUserPlan(caller);
  };

  public query ({ caller }) func doesInvoiceNumberExist(invoiceNumber : Text) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only privileged users can check invoice numbers");
    };

    switch (userInvoiceIds.get(caller)) {
      case (null) { false };
      case (?ids) {
        for (id in ids.values()) {
          switch (invoices.get(id)) {
            case (null) {};
            case (?invoice) {
              if (invoice.invoiceNumber == invoiceNumber) { return true };
            };
          };
        };
        false;
      };
    };
  };

  public query ({ caller }) func getSavedInvoiceNumbers() : async [Text] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only privileged users can get invoice numbers");
    };

    switch (userInvoiceIds.get(caller)) {
      case (null) { [] };
      case (?ids) {
        let mapped = ids.map<Text, ?InvoiceRecord>(
          func(id) {
            invoices.get(id);
          }
        );
        let filtered = mapped.filter(
          func(x) { x != null }
        );
        let nonNulls = filtered.toArray().map(
          func(x) {
            switch (x) {
              case (?value) { value };
              case (null) { invoices.values().toArray()[0] };
            };
          }
        );
        let invoiceNumbers = nonNulls.map(
          func(invoice) { invoice.invoiceNumber }
        );
        invoiceNumbers;
      };
    };
  };
};

