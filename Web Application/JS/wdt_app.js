// ---------------------------
// Global Variables
// ---------------------------

let staffList = [];
let drivers = [];
let selectedStaff = null;
let selectedDelivery = null;

// ---------------------------
// Employee Classes
// ---------------------------

class Employee {
	constructor(name, surname) {
		this.name = name;
		this.surname = surname;
	}
}

class StaffMember extends Employee {
	constructor(
		picture,
		name,
		surname,
		email,
		status,
		outTime,
		duration,
		expectedReturn
	) {
		super(name, surname);
		this.picture = picture;
		this.email = email;
		this.status = status;
		this.outTime = outTime;
		this.duration = duration;
		this.expectedReturn = expectedReturn;
	}

	staffMemberIsLate() {
		if (!this.expectedReturn || !this.expectedReturn.includes(":")) {
			return;
		}

		const currentTime = new Date();
		const expectedReturnTime = new Date();
		const [hours, minutes] = this.expectedReturn.split(":").map(Number);
		expectedReturnTime.setHours(hours, minutes, 0, 0);

		const lateBy = Math.trunc(
			(currentTime.getTime() - expectedReturnTime.getTime()) / (1000 * 60)
		);

		if (lateBy >= 1) {
			const toastId = `toast-${this.email.replace(/[@.]/g, "-")}`;
			const existingToast = $(`#${toastId}`);

			if (existingToast.length) {
				existingToast.find(".late-time").text(`is late by ${lateBy} min`);
			} else {
				$("#staffToasts").append(`
					<div id="${toastId}" class="toast" role="alert" aria-live="assertive" aria-atomic="true" data-closed="false" data-bs-autohide="false">
						<div class="toast-header">
							<strong class="me-auto">Late staff member!</strong>
							<button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
						</div>
						<div class="toast-body">
							<img src="${this.picture}"/><br>
							${this.name} ${this.surname}<br>
							<div class="late-time">is late by ${lateBy} min</div>
						</div>
					</div>
				`);

				const toastElement = document.getElementById(toastId);
				const toast = new bootstrap.Toast(toastElement);
				toast.show();

				$(toastElement).on("hidden.bs.toast", () => {
					$(this).data("closed", true);
				});
			}
		}
	}

	resetToast() {
		const toastId = `toast-${this.email.replace(/[@.]/g, "-")}`;
		$(`#${toastId}`).remove();
	}
}

class DeliveryDriver extends Employee {
	constructor(name, surname, vehicle, telephone, deliveryAddress, returnTime) {
		super(name, surname);
		this.vehicle = vehicle;
		this.telephone = telephone;
		this.deliveryAddress = deliveryAddress;
		this.returnTime = returnTime;
	}
	deliveryDriverIsLate() {
		const currentTime = new Date();
		const expectedReturn = new Date();

		const [hours, minutes] = this.returnTime.split(":").map(Number);
		expectedReturn.setHours(hours, minutes, 0, 0);

		const lateBy =
			(currentTime.getTime() - expectedReturn.getTime()) / (1000 * 60);

		if (lateBy > 1) {
			let deliveryId = `toast-${this.telephone}`;
			let existingToast = $(`#${deliveryId}`);

			if (existingToast.length) {
				return;
			}
			$("#deliveryToasts").append(`
							<div id="${deliveryId}" class="toast" role="alert" aria-live="assertive" aria-atomic="true" data-closed="false" data-bs-autohide="false">
								<div class="toast-header">
									<span>Late delivery driver!</span>
									<button type="button" class="btn-close ms-auto" data-bs-dismiss="toast" aria-label="Close"></button>
								</div>
								<div class="toast-body">
									${this.name} ${this.surname} is late!<br>
									Return time was: ${this.returnTime}<br>
									Phone number: ${this.telephone}<br>
									Address: ${this.deliveryAddress}
								</div>
							</div>
						`);

			const toastElement = document.getElementById(deliveryId);
			const toast = new bootstrap.Toast(toastElement);
			toast.show();

			$(toastElement).on("hidden.bs.toast", function () {
				$(this).data("closed", true);
			});
		}
	}
}

// ---------------------------
// Staff Fetch and add to table
// ---------------------------

async function staffUserGet() {
	try {
		let response = await fetch("https://randomuser.me/api/?results=5");
		let data = await response.json();
		staffList = data.results.map(
			(staffList) =>
				new StaffMember(
					staffList.picture.thumbnail,
					staffList.name.first,
					staffList.name.last,
					staffList.email,
					"In",
					"",
					"",
					""
				)
		);
	} catch (error) {
		console.error("Error fetching staff members:", error);
	}

	populateStaffTable();
}

function populateStaffTable() {
	const table = $(".staffTable tbody");
	table.empty();

	staffList.forEach((staff, num) => {
		const row = $(`
        <tr class="employeeRow" data-index="${num}">
            <td><img src="${staff.picture}" /></td>
            <td>${staff.name}</td>
            <td>${staff.surname}</td>
            <td>${staff.email}</td>
            <td>${staff.status}</td>
            <td>${staff.outTime}</td>
            <td>${staff.duration}</td>
            <td>${staff.expectedReturn}</td>
        </tr>`);
		table.append(row);
	});
}

// ---------------------------
// Staff Check-Out & Check-In
// ---------------------------

function staffOut() {
	if (selectedStaff === null || staffList[selectedStaff] === undefined) {
		Swal.fire({
			text: "Select a staff member first!",
			icon: "info",
			confirmButtonText: "OK",
			confirmButtonColor: "#0e8ea8",
			cancelButtonText: "Cancel",
			allowOutsideClick: false,
			backdrop: "rgba(0, 0, 0, 0.88)",
		});
		return;
	}

	let staff = staffList[selectedStaff];

	Swal.fire({
		icon: "question",
		title: `How long will ${staff.name} be out? (in minutes)`,
		input: "text",
		cancelButtonText: "Cancel",
		showCancelButton: true,
		allowOutsideClick: false,
		backdrop: "rgba(0, 0, 0, 0.88)",
	}).then((result) => {
		if (result.isDismissed) {
			return;
		}

		let duration = result.value.trim();

		if (isNaN(duration) || duration === "") {
			Swal.fire({
				text: "Enter time in minutes.",
				icon: "error",
				confirmButtonText: "OK",
				allowOutsideClick: false,
				backdrop: "rgba(0, 0, 0, 0.88)",
			});
			return;
		}

		duration = parseInt(duration);

		let timeFormatted;
		if (duration >= 60) {
			const hours = Math.floor(duration / 60);
			const minutes = duration % 60;
			timeFormatted = `${hours}hr ${minutes}min`;
			if (duration === 60) {
				timeFormatted = `${hours}hr`;
			}
		} else {
			timeFormatted = `${duration}min`;
		}

		const outTime = new Date();
		const expectedReturn = new Date(
			outTime.getTime() + duration * 60000
		).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

		staff.status = "Out";
		staff.outTime = outTime.toLocaleTimeString([], {
			hour: "2-digit",
			minute: "2-digit",
		});
		staff.duration = timeFormatted;
		staff.expectedReturn = expectedReturn;

		populateStaffTable();
	});
}

function staffIn() {
	if (selectedStaff === null || staffList[selectedStaff] === undefined) {
		Swal.fire({
			text: "Select a staff member first!",
			icon: "info",
			confirmButtonText: "OK",
			confirmButtonColor: "#0e8ea8",
			allowOutsideClick: false,
			backdrop: "rgba(0, 0, 0, 0.88)",
		});
		return;
	}

	let staff = staffList[selectedStaff];

	staff.status = "In";
	staff.outTime = "";
	staff.duration = "";
	staff.expectedReturn = "";

	staff.resetToast();

	populateStaffTable();
	selectedStaff = null;
	$(".employeeRow").removeClass("selectedStaff");
}

function checkLate() {
	staffList.forEach((staff) => staff.staffMemberIsLate());
	drivers.forEach((driver) => driver.deliveryDriverIsLate());
}

setInterval(checkLate, 30000);

// ---------------------------
// Delivery Handling
// ---------------------------

function addDelivery() {
	const deliveryForm = document.getElementById("deliveryForm");

	const name = document.getElementById("deliveryName").value;
	const surname = document.getElementById("deliverySurname").value;
	const telephone = document.getElementById("deliveryTelephone").value;
	const address = document.getElementById("deliveryAddress").value;
	const returnTime = document.getElementById("deliveryReturn").value;
	let vehicle = document.getElementById("deliveryVehicle");

	if (vehicle.value === "car") {
		vehicle = `<i class="fa-solid fa-car-side vehicleIcon"></i>`;
	} else if (vehicle.value === "motorcycle") {
		vehicle = `<i class="fa-solid fa-motorcycle vehicleIcon"></i>`;
	}

	const deliveryDriver = new DeliveryDriver(
		name,
		surname,
		vehicle,
		telephone,
		address,
		returnTime
	);

	drivers.push(deliveryDriver);

	const table = $("#deliveryBoard tbody");
	const row = `<tr class="deliveryRow">
					<td>${deliveryDriver.vehicle}</td>
					<td id="driverName-${deliveryDriver.telephone}">${deliveryDriver.name}</td>
					<td id="driverSurname-${deliveryDriver.telephone}">${deliveryDriver.surname}</td>
					<td id="driverTelephone-${deliveryDriver.telephone}">${deliveryDriver.telephone}</td>
					<td id="driverAddress-${deliveryDriver.telephone}">${deliveryDriver.deliveryAddress}</td>
					<td id="returnTime-${deliveryDriver.telephone}">${deliveryDriver.returnTime}</td>

				</tr>`;
	table.append(row);
	deliveryForm.reset();
}

// ---------------------------
// Form Validation
// ---------------------------

function validateForm() {
	$.validator.addMethod(
		"streetNumber",
		function (value) {
			return /^[A-Za-z\s]+(?:\s\d+[A-Za-z]?)$/.test(value);
		},
		"This field is required."
	);

	$("#deliveryForm").validate({
		rules: {
			name: {
				required: true,
			},
			surname: {
				required: true,
			},
			telephone: {
				required: true,
				minlength: 7,
				digits: true,
			},
			address: {
				required: true,
				streetNumber: true,
			},
			returnTime: {
				required: true,
			},
		},
		messages: {
			name: {
				required: "First name is required.",
			},
			surname: {
				required: "Surname is required.",
			},
			telephone: {
				required: "A phone number is required.",
				minlength: "Enter a valid phone number.",
				digits: "Must only contain numbers.",
			},
			address: {
				required: "Address is required.",
			},
			returnTime: {
				required: "Enter return time.",
			},
		},

		invalidHandler: function (event, validator) {
			if (
				validator.errorList.some((error) => error.element.name === "address")
			) {
				Swal.fire({
					text: "Please enter a valid address (e.g., 'Main Street 123').",
					icon: "error",
					confirmButtonText: "OK",
					confirmButtonColor: "#0e8ea8",
					allowOutsideClick: true,
					backdrop: "rgba(0, 0, 0, 0.88)",
				});
			}
		},

		submitHandler: addDelivery,
	});
}

function digitalClock() {
	const d = new Date();
	const days = [
		"Monday",
		"Tuesday",
		"Wednesday",
		"Thursday",
		"Friday",
		"Saturday",
		"Sunday",
	];
	const months = [
		"January",
		"February",
		"March",
		"April",
		"May",
		"June",
		"July",
		"August",
		"September",
		"October",
		"November",
		"December",
	];

	document.getElementById("digitalClock").innerHTML = `${days[d.getDay()]}, ${
		months[d.getMonth()]
	} ${d.getDate()}, ${d.getFullYear()} at ${d.toLocaleTimeString()}`;
}

setInterval(digitalClock, 1000);

// ---------------------------
// Page Initialization
// ---------------------------

$(document).ready(function() {
	$("#outBtn").on("click", staffOut);
	$("#inBtn").on("click", staffIn);
	$("#addBtn").on("click", validateForm);
	$("#btnClear").on("click", function () {
		const selectedRow = $("tr.selectedDelivery");

		if (selectedRow.length) {
			const firstName = selectedRow.find("td:nth-child(2)").text();
			const lastName = selectedRow.find("td:nth-child(3)").text();
			const telephone = selectedRow.find("td:nth-child(4)").text();

			Swal.fire({
				icon: "warning",
				title: `Remove ${firstName} ${lastName} from the table?`,
				showDenyButton: true,
				denyButtonColor: "#e70017",
				confirmButtonText: "Yes",
				denyButtonText: "No",
				backdrop: "rgba(0, 0, 0, 0.88)",
			}).then((result) => {
				if (result.isConfirmed) {
					selectedRow.remove();
					$(`#toast-${telephone}`).remove();

					const driverIndex = drivers.findIndex((driver) => driver.telephone === telephone);
					if (driverIndex !== -1) {
						drivers.splice(driverIndex, 1);
					}
				}
			});
		}
	});

	$(document).on("click", ".employeeRow", function () {
		const staffRow = $(this).data("index");

		if (selectedStaff === staffRow) {
			$(this).removeClass("selectedStaff");
			selectedStaff = null;
		} else {
			$(".employeeRow").removeClass("selectedStaff");
			$(this).addClass("selectedStaff");
			selectedStaff = staffRow;
		}
	});

	$(document).on("click", ".deliveryRow", function () {
		const deliveryRow = this;

		if (selectedDelivery === deliveryRow) {
			$(this).removeClass("selectedDelivery");
			selectedDelivery = null;
		} else {
			$(".deliveryRow").removeClass("selectedDelivery");
			$(this).addClass("selectedDelivery");
			selectedDelivery = deliveryRow;
		}
	});

	staffUserGet();

})

