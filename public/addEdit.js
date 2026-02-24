import { enableInput, inputEnabled, message, setDiv, token } from "./index.js";
import { showJobs } from "./jobs.js";

let addEditDiv = null;
let companyName = null;
let positionName = null;
let status = null;
let addingJob = null;

export const handleAddEdit = () => {
  addEditDiv = document.getElementById("edit-job");
  companyName = document.getElementById("companyName");
  positionName = document.getElementById("positionName");
  status = document.getElementById("status");
  addingJob = document.getElementById("adding-job");
  const editCancel = document.getElementById("edit-cancel");

  addEditDiv.addEventListener("click", async (e) => {
    if (inputEnabled && e.target.nodeName === "BUTTON") {
      if (e.target === addingJob) {
        enableInput(false);
        message.textContent = "Adding job...";

        let method = "POST";
        let url = "/api/v1/jobs";
        if (addingJob.textContent === "update") {
          method = "PATCH";
          url = `/api/v1/jobs/${addEditDiv.dataset.id}`;
        }

        try {
          const response = await fetch(url, {
            method: method,
            headers: { 
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({
              companyName: companyName.value,
              positionName: positionName.value,
              status: status.value,
            }),
          });

          const data = await response.json();
          if (response.status === 200 || response.status === 201) {
            if (response.status === 200) {
              message.textContent = "The job entry was updated.";
            } else {
              message.textContent = "The job entry was created.";
            }

            companyName.value = "";
            positionName.value = "";
            status.value = "pending";

            showJobs();
          } else {
            message.textContent = data.message || "Failed to add job";
          }
        } catch (err) {
          console.error(err);
          message.textContent = "A communications error occurred.";
        }
        
        enableInput(true);
      } else if (e.target === editCancel) { 
        message.textContent = "";
        showJobs();
      }
    }
  });
};

export const showAddEdit = async (jobId) => {
  if (!jobId) {
    companyName.value = "";
    positionName.value = "";
    status.value = "pending";
    addingJob.textContent = "add";
    message.textContent = "";

    setDiv(addEditDiv);
  } else {
    enableInput(false);

    try {
      const response = await fetch(`/api/v1/jobs/${jobId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.status === 200) {
        companyName.value = data.job.companyName;
        positionName.value = data.job.positionName;
        status.value = data.job.status;
        addingJob.textContent = "update";
        message.textContent = "";
        addEditDiv.dataset.id = jobId;

        setDiv(addEditDiv);
      } else {
        // might happen if the list has been updated since last display
        message.textContent = "The jobs entry was not found";
        showJobs();
      }
    } catch (err) {
      console.log(err);
      message.textContent = "A communications error has occurred.";
      showJobs();
    }

    enableInput(true);
  }
};