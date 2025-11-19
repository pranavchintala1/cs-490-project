import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Container, Card, Button, Alert, Spinner } from "react-bootstrap";

export default function NetworkOverview() {
	const [contacts, setContacts] = useState([]);
	const [loading, setLoading] = useState(true);
	const [fadeOut, setFadeOut] = useState(false);

	useEffect(() => {
		const loadingTimer = setTimeout(() => {
            setLoading(false);
        }, 2000);

        return () => clearTimeout(loadingTimer);
	}, [])

	return (
		<Container fluid className="dashboard-gradient min-vh-100 py-4">
			{loading ? (
				<div className="dashboard-gradient min-vh-100 py-4">
					<h1 className="text-center text-white fw-bold mb-5 display-4">
						Your Professional Network
					</h1>
					<div
						className="d-flex flex-column align-items-center justify-content-center"
						style={{ height: "200px" }}
					>
						<Spinner animation="border" variant="light" className="mb-3" />
						<p className="text-white fs-5">
							Hold on while we fetch your contacts...
						</p>
					</div>
				</div>
			) : (
				<div className="dashboard-gradient min-vh-100 py-4">
					<h1 className="text-center text-white fw-bold mb-5 display-4">
						Your Professional Network
					</h1>
					<div>
					</div>
					<Card style={{width: "18rem"}}>
						<Card.Img src={"./placeholder"} />
						<Card.Body>Hello there</Card.Body>
					</Card>
				</div>
			)}
		</Container>
	);
}
