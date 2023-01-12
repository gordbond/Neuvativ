import React, { useState } from 'react';
import Amplify from 'aws-amplify';
import {  useLocation } from 'react-router-dom';
import DetailsTable from '../components/DetailsTable';
import awsExports from '../aws-exports';
import { useNavigate } from 'react-router-dom';
Amplify.configure(awsExports);

/**
 * Details page
 * - Detailed view of a project including roof layout
 * @returns 
 */
export function ProjectsDetails() {
    const location = useLocation();
    const [project, setProject] = useState(JSON.parse(location.state))
    
    const navigate = useNavigate();



    return (
        <div className="main-container">
            <div className="content-container">
                
                <legend className="caption">Project Details</legend>
                
                <button className="sm-btn-pv"  onClick={() => navigate(-1)}>Previous page</button>
                <br/>
                <DetailsTable
                    project={project}
                    setProject={setProject}
                />
                <br/>
            </div>
        </div>
    );
}

export default ProjectsDetails;