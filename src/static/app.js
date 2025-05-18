document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Add event delegation for delete buttons
  activitiesList.addEventListener('click', async (event) => {
    const deleteBtn = event.target.closest('.delete-participant');
    if (!deleteBtn) return;

    const activity = deleteBtn.dataset.activity;
    const email = deleteBtn.dataset.email;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/unregister?email=${encodeURIComponent(email)}`,
        {
          method: 'DELETE',
        }
      );

      const result = await response.json();

      if (response.ok) {
        // Refresh the activities list
        await fetchActivities();
        
        messageDiv.textContent = result.message;
        messageDiv.className = 'success';
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = 'error';
      }

      messageDiv.classList.remove('hidden');

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add('hidden');
      }, 5000);

    } catch (error) {
      messageDiv.textContent = "Failed to unregister. Please try again.";
      messageDiv.className = 'error';
      messageDiv.classList.remove('hidden');
      console.error("Error unregistering:", error);
    }
  });

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          <div class="participants-list">
            <h5>Current Participants:</h5>
            ${details.participants.length > 0 
              ? `<ul>${details.participants.map(email => `
                  <li>
                    <span class="participant-email">${email}</span>
                    <button class="delete-participant" data-activity="${name}" data-email="${email}">
                      <span class="delete-icon">×</span>
                    </button>
                  </li>`).join('')}</ul>`
              : '<p class="no-participants">No participants yet</p>'
            }
          </div>
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
