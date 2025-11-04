import React, { useState } from "react";

export default function JobForm({ addJob, cancelAdd }) {
	const [form, setForm] = useState({
		title: "",
		company: "",
		location: "",
		salary: "",
		url: "",
		deadline: "",
		industry: "",
		jobType: "",
		description: "",
		status: "Interested",
	});

	const handleChange = (e) => {
		const { name, value } = e.target;
		setForm({ ...form, [name]: value });
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		if (!form.title || !form.company) {
			alert("Job title and company are required.");
			return;
		}
		addJob(form);
		setForm({
			title: "",
			company: "",
			location: "",
			salary: "",
			url: "",
			deadline: "",
			industry: "",
			jobType: "",
			description: "",
			status: "Interested",
		});
	};

	return (
		<form className="job-form" onSubmit={handleSubmit}>
			<h3>Add Job</h3>
			<input
				type="text"
				name="title"
				placeholder="Job Title *"
				value={form.title}
				onChange={handleChange}
				required
			/>
			<input
				type="text"
				name="company"
				placeholder="Company *"
				value={form.company}
				onChange={handleChange}
				required
			/>
			<input
				type="text"
				name="location"
				placeholder="Location"
				value={form.location}
				onChange={handleChange}
			/>
			<input
				type="text"
				name="salary"
				placeholder="Salary Range"
				value={form.salary}
				onChange={handleChange}
			/>
			<input
				type="url"
				name="url"
				placeholder="Job Posting URL"
				value={form.url}
				onChange={handleChange}
			/>
			<input
				type="date"
				name="deadline"
				placeholder="Application Deadline"
				value={form.deadline}
				onChange={handleChange}
			/>
			<select name="industry" value={form.industry} onChange={handleChange}>
				<option value="">Select Industry</option>
				<option>Tech</option>
				<option>Finance</option>
				<option>Design</option>
				<option>Education</option>
			</select>
			<select name="jobType" value={form.jobType} onChange={handleChange}>
				<option value="">Select Job Type</option>
				<option>Full-Time</option>
				<option>Part-Time</option>
				<option>Contract</option>
				<option>Internship</option>
			</select>
			<textarea
				name="description"
				placeholder="Job Description (max 2000 chars)"
				maxLength="2000"
				value={form.description}
				onChange={handleChange}
			/>
			<select name="status" value={form.status} onChange={handleChange}>
				<option>Interested</option>
				<option>Applied</option>
				<option>Phone Screen</option>
				<option>Interview</option>
				<option>Offer</option>
				<option>Rejected</option>
			</select>

			<div className="buttons">
				<button type="submit">Save</button>
				<button type="button" onClick={cancelAdd}>Cancel</button>
			</div>
		</form>
	);
}
