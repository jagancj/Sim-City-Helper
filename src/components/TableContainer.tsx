import React, { useEffect } from 'react';
import './TableContainer.css';

interface ContainerProps {
  id: number;
  mat_name: string;
  haveQty: number;
  requiredQty: number;
}

const TableContainer: React.FC<{ material: ContainerProps[], title: string }> = ({ material, title }) => {

  return (
    <div className="container">
      <h4>{title}</h4>
      <table className="material-table">
        <thead>
          <tr>
            <th>Material</th>
            <th>Have</th>
            <th>Req</th>
            <th>Rem</th>
          </tr>
        </thead>
        <tbody>
          {material.map((mat: ContainerProps) => (
            <tr key={mat.id}>
              <td className='text-style'>
                <img
                  src={`../assets/images/${mat.mat_name}.png`}
                  alt={mat.mat_name}
                />
                <span>{mat.mat_name}</span>
              </td>
              <td>{mat.haveQty}</td>
              <td>{mat.requiredQty}</td>
              <td>{mat.haveQty - mat.requiredQty}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableContainer;
