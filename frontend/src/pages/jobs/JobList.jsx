import React, { useState } from "react";
import JobForm from "./JobForm";
import JobCard from "./JobCard";

export default function JobsList() {
	const [jobs, setJobs] = useState([
		{
			id: 1,
			title: "Frontend Developer",
			company: "TechCorp",
			location: "Remote",
			salary: "$70k–$90k",
			url: "https://example.com/job1",
			deadline: "2025-12-01",
			industry: "Tech",
			jobType: "Full-Time",
			description: "Work on frontend interfaces using React.",
			status: "Applied",
		},
		{
			id: 2,
			title: "UX Designer",
			company: "Designify",
			location: "New York, NY",
			salary: "$80k–$100k",
			url: "",
			deadline: "2025-11-20",
			industry: "Design",
			jobType: "Full-Time",
			description: "Design modern, user-centered interfaces.",
			status: "Interested",
		},
	]);

	const [search, setSearch] = useState("");
	const [statusFilter, setStatusFilter] = useState("All");
	const [industryFilter, setIndustryFilter] = useState("All");

	const addJob = (job) => {
		setJobs([...jobs, { ...job, id: Date.now() }]);
	};

	const deleteJob = (id) => {
		setJobs(jobs.filter((j) => j.id !== id));
	};

	const filteredJobs = jobs.filter((job) => {
		const matchesSearch =
			job.title.toLowerCase().includes(search.toLowerCase()) ||
			job.company.toLowerCase().includes(search.toLowerCase());
		const matchesStatus =
			statusFilter === "All" || job.status === statusFilter;
		const matchesIndustry =
			industryFilter === "All" || job.industry === industryFilter;
		return matchesSearch && matchesStatus && matchesIndustry;
	});

	return (
		<div className="jobs-list">
			<h2>Job Opportunities</h2>

			{/* Job form always visible on top */}
			<JobForm addJob={addJob} />

			<div
				className="job-controls"
				style={{
					display: "flex",
					gap: "10px",
					margin: "12px 0",
					flexWrap: "wrap",
				}}
			>
				<input
					type="text"
					placeholder="Search by title or company..."
					value={search}
					onChange={(e) => setSearch(e.target.value)}
				/>
				<select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
					<option>All</option>
					<option>Interested</option>
					<option>Applied</option>
					<option>Phone Screen</option>
					<option>Interview</option>
					<option>Offer</option>
					<option>Rejected</option>
				</select>
				<select value={industryFilter} onChange={(e) => setIndustryFilter(e.target.value)}>
					<option>All</option>
					<option>Tech</option>
					<option>Finance</option>
					<option>Design</option>
					<option>Education</option>
				</select>
			</div>

			{/* Grid layout for job cards */}
			<div
				className="job-cards"
				style={{
					display: "grid",
					gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
					gap: "16px",
				}}
			>
				{filteredJobs.length > 0 ? (
					filteredJobs.map((job) => (
						<JobCard key={job.id} job={job} deleteJob={deleteJob} />
					))
				) : (
					<p>No jobs found.</p>
				)}
			</div>
		</div>
	);
}
